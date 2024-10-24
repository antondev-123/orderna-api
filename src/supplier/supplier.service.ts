import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmpty } from 'class-validator';
import { FilterPeriod, PaymentType, SortOrder, UserStatus } from 'src/common/constants';
import { errorResponseMessage, storeResponseMessage, supplierResponseMessage } from 'src/common/constants/response-messages';
import { getEntityColumns } from 'src/common/utils/entity.util';
import { applyFilterByStaticPeriod } from 'src/common/utils/filter.util';
import { ContactInformationEntity } from 'src/contact-information/contact-information.entity';
import { StoreRepository } from 'src/store/repository/store.repository';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateSupplierDto } from './dtos/create-supplier.dto';
import { FilterSupplierDto } from './dtos/filter-supplier.dto';
import { UpdateSupplierDto } from './dtos/update-supplier.dto';
import { SupplierEntity } from './supplier.entity';
import { Purchase } from 'src/inventory/purchase/purchase.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(ContactInformationEntity)
    private contactInfoRepository: Repository<ContactInformationEntity>,
    @InjectRepository(SupplierEntity)
    private readonly suppliersRepository: Repository<SupplierEntity>,
    @InjectRepository(StoreRepository)
    private readonly storeRepository: StoreRepository,
  ) { }

  async create(createSupplierDto: CreateSupplierDto) {
    try {
      const store = await this.storeRepository.findStoreById(createSupplierDto.storeId)
      if (!store) {
        throw new NotFoundException(
          storeResponseMessage.STORE_NOT_FOUND.EN,
          errorResponseMessage.NOT_FOUND.EN,
        );
      }
      const contactInfo = this.contactInfoRepository.create({
        email: createSupplierDto.supplierEmail,
        city: createSupplierDto.supplierCity,
        company: createSupplierDto.supplierCompany,
        firstName: createSupplierDto.supplierFirstName,
        lastName: createSupplierDto.supplierLastName,
        mobile: createSupplierDto.mobile,
        telephone: createSupplierDto.telephone,
        street: createSupplierDto.supplierStreet,
        zipCode: createSupplierDto.supplierZipCode
      });

      const supplier = this.suppliersRepository.create();
      supplier.contactInfo = contactInfo;
      supplier.supplierNote = createSupplierDto.supplierNote;
      supplier.status = createSupplierDto.status;
      supplier.store = store;


      await this.suppliersRepository.save(supplier);
      return supplier;
    } catch (error) {
      throw error;
    }
  }

  // TODO: Filter suppliers by searchValue
  // TODO: Filter suppliers by paymentType
  async findAll(
    filter: FilterSupplierDto
  ) {
    try {
      const { page, limit } = filter;
      const { sortBy, sortOrder, searchValue } = filter;
      const query = this.suppliersRepository.createQueryBuilder('supplier')
        .leftJoinAndSelect('supplier.contactInfo', 'contactInfo');

      this.applyFilters(query, filter);
      this.applyPagination(query, page, limit);
      this.applySorting('supplier', query, sortBy, sortOrder);

      const [result, total] = await query.getManyAndCount();

      return { result, total };
    } catch (error) {
      throw error;
    }
  }

  async findAllSummary(
    filter: FilterSupplierDto
  ) {
    try {
      const { page, limit } = filter;
      const { sortBy, sortOrder, searchValue } = filter;

      const lastPurchaseSubquery = (qb) => qb
        .select()
        .from(Purchase, 'p')
        .orderBy('p.purchaseDate', 'DESC')
        .limit(1)

      const query = this.suppliersRepository.createQueryBuilder('supplier')
        // Select which supplier table columns are displayed
        .select([
          'supplier.id',
          'supplier.createdAt',
          'supplier.status',
          'supplier.supplierNote AS note'// TODO: Rename supplierNote to just 'note'
        ])
        // Display all contact info columns
        .leftJoinAndSelect('supplier.contactInfo', 'contactInfo')
        .leftJoin(
          lastPurchaseSubquery,
          'lastPurchase',
          'lastPurchase.supplierID = supplier.id'
        )
        .leftJoin('purchases', 'purchase', 'purchase.supplierID = supplier.id')
        // Aggregated columns
        .addSelect([
          'COALESCE(SUM(purchase.quantity), 0) AS totalPurchasesCount',
          'COALESCE(SUM(purchase.purchasePrice), 0) AS totalSpentAmount',
          'lastPurchase.purchaseID AS lastPurchaseId'
        ])
        .groupBy('supplier.id')


      this.applyFilters(query, filter);
      this.applyPagination(query, page, limit);
      this.applySorting('supplier', query, sortBy, sortOrder);

      const { entities: suppliers, raw } = await query.getRawAndEntities();
      const total = await query.getCount();

      // Get aggregated columns from raw result and combine it with entity result
      const result = suppliers.map((supplier, index) => {
        const { totalPurchasesCount, totalSpentAmount, lastPurchaseId } = raw[index]
        return {
          ...supplier,
          totalPurchasesCount,
          totalSpentAmount,
          lastPurchaseId
        }
      });

      return { result, total };
    } catch (error) {
      throw error;
    }
  }

  async findOne(supplierId: number) {
    try {
      const supplier = await this.suppliersRepository.findOne({
        where: { id: supplierId },
        relations: { contactInfo: true }
      });
      if (!supplier) {
        throw new NotFoundException(
          supplierResponseMessage.SUPPLIER_NOT_FOUND.EN,
          errorResponseMessage.NOT_FOUND.EN
        );
      }
      return supplier;
    } catch (error) {
      throw error;
    }
  }

  async update(supplierId: number, updateSupplierDto: UpdateSupplierDto) {
    try {
      const supplier = await this.suppliersRepository.findOne({
        where: { id: supplierId },
        relations: { contactInfo: true },
      });

      if (!supplier) {
        throw new NotFoundException(
          supplierResponseMessage.SUPPLIER_NOT_FOUND.EN,
          errorResponseMessage.NOT_FOUND.EN
        );
      }

      if (updateSupplierDto.storeId) {
        const store: any = await this.storeRepository.findStoreById(updateSupplierDto.storeId)
        if (!store) {
          throw new NotFoundException(
            storeResponseMessage.STORE_NOT_FOUND,
            errorResponseMessage.NOT_FOUND.EN,
          );
        }
        supplier.store = store.id
      }

      isEmpty(updateSupplierDto.supplierNote) ? supplier.supplierNote : supplier.supplierNote = updateSupplierDto.supplierNote;
      isEmpty(updateSupplierDto.status) ? supplier.status : supplier.status = updateSupplierDto.status;

      const contactInfo = this.contactInfoRepository.create({
        company: updateSupplierDto.supplierCompany,
        firstName: updateSupplierDto.supplierFirstName,
        lastName: updateSupplierDto.supplierLastName,
        mobile: updateSupplierDto.mobile,
        telephone: updateSupplierDto.telephone,
        email: updateSupplierDto.supplierEmail,
        city: updateSupplierDto.supplierCity,
        street: updateSupplierDto.supplierStreet,
        zipCode: updateSupplierDto.supplierZipCode
      });

      Object.assign(supplier.contactInfo, contactInfo);
      await this.suppliersRepository.save(supplier);
      return supplier;
    } catch (error) {
      throw error;
    }
  }

  async remove(supplierId: number) {
    try {
      const supplier = await this.suppliersRepository.findOne({
        where: { id: supplierId },
        relations: { contactInfo: true },
      });
      if (!supplier) {
        throw new NotFoundException(
          supplierResponseMessage.SUPPLIER_NOT_FOUND.EN,
          errorResponseMessage.NOT_FOUND.EN
        );
      }
      await this.suppliersRepository.remove(supplier);
      return supplier;
    } catch (error) {
      throw error;
    }
  }

  async bulkRemove(ids: number[]) {
    try {
      const suppliers = await this.suppliersRepository.findBy({ id: In(ids) });
      if (suppliers.length === 0) {
        throw new NotFoundException(
          supplierResponseMessage.SUPPLIERS_NOT_FOUND,
          errorResponseMessage.NOT_FOUND.EN
        );
      }
      await this.suppliersRepository.remove(suppliers);
      return suppliers;
    } catch (error) {
      throw error;
    }
  }

  private applyFilters(query: SelectQueryBuilder<SupplierEntity>, filter: FilterSupplierDto) {
    this.applySearchFilter('contactInfo', query, filter.searchValue,);
    this.applyStatusFilter('supplier', query, filter.status);
    this.applyStaticPeriodFilter('supplier', query, filter.period);
    //TODO: this should be used when joining with either purchase or transaction table
    // this.applyPaymentTypeFilter(query, filter.paymentType, 'supplier');
  }

  private applySearchFilter(tableAlias: string, query: SelectQueryBuilder<SupplierEntity>, searchValue: string) {
    if (searchValue) {
      query.andWhere(`${tableAlias}.firstName LIKE :name OR ${tableAlias}.lastName LIKE :name`, { name: `%${searchValue}%` });
    }
  }

  private applyStatusFilter(tableAlias: string, query: SelectQueryBuilder<SupplierEntity>, status: UserStatus) {
    if (status) {
      query.andWhere(`${tableAlias}.status = :status`, { status: status });
    }
  }

  private applyStaticPeriodFilter(tableAlias: string, query: SelectQueryBuilder<SupplierEntity>, period: FilterPeriod) {
    if (period) {
      applyFilterByStaticPeriod(query, period, tableAlias);
    }
  }

  private applyPaymentTypeFilter(tableAlias: string, query: SelectQueryBuilder<SupplierEntity>, paymentType: PaymentType) {
    if (paymentType) {
      query.andWhere(`${tableAlias}.paymentType = :paymentType`, { status: paymentType });
    }
  }

  private applyPagination(query: SelectQueryBuilder<SupplierEntity>, page?: number, limit?: number) {
    if (limit) {
      query.take(limit);
    }
    if (page) {
      query.skip((page - 1) * limit);
    }
  }

  private applySorting(tableAlias: string, query: SelectQueryBuilder<SupplierEntity>, sortBy?: string, sortOrder?: SortOrder) {
    if (sortBy) {
      const entityColumns: string[] = getEntityColumns([SupplierEntity, ContactInformationEntity]);

      const order = sortOrder || 'ASC';
      if (entityColumns.includes(sortBy)) {
        query.orderBy(`${tableAlias}.${sortBy} = :sortBy`, order);
        query.setParameter("sortBy", sortBy);
      }
    }
  }
}


