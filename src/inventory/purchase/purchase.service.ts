import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterPeriod } from 'src/common/constants';
import { applyFilterByStaticPeriod } from 'src/common/utils/filter.util';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { Store } from '../../store/entities/store.entity';
import { SupplierEntity } from '../../supplier/supplier.entity';
import { InventoryItem } from '../inventories.entity';
import { StockControl } from '../stock-control.entity';
import { PurchaseFilterDto } from './dtos/filter-purchase.dto';
import { CreatePurchaseDto, UpdatePurchaseDto } from './dtos/purchase.dto';
import { Purchase } from './purchase.entity';

@Injectable()
export class PurchaseService {
    constructor(
        @InjectRepository(Purchase)
        private purchaseRepository: Repository<Purchase>,
        @InjectRepository(InventoryItem)
        private inventoryItemRepository: Repository<InventoryItem>,
        @InjectRepository(Store)
        private storesRepository: Repository<Store>,
        @InjectRepository(SupplierEntity)
        private supplierRepository: Repository<SupplierEntity>,
        @InjectRepository(StockControl)
        private stockControlRepository: Repository<StockControl>,
    ) { }

    private applyStaticPeriodFilter(tableAlias: string, query: SelectQueryBuilder<Purchase>, period: FilterPeriod) {
        if (period) {
            applyFilterByStaticPeriod(query, period, tableAlias);
        }
    }

    async getPurchases(query: PurchaseFilterDto): Promise<Purchase[]> {
        try {
            const {
                inventoryItemID,
                supplierID,
                storeId,
                sortBy,
                sortOrder,
                searchValue,
                period,
                page = 1,
                limit = 10
            } = query;

            let qb: SelectQueryBuilder<Purchase> = this.purchaseRepository.createQueryBuilder('purchase')
                .leftJoinAndSelect('purchase.inventoryItem', 'inventoryItem')
                .leftJoinAndSelect('purchase.supplier', 'supplier')
                .leftJoinAndSelect('supplier.contactInfo', 'supplierContactInfo')
                .leftJoinAndSelect('purchase.store', 'store');

            qb = qb.addSelect(
                "CONCAT(supplierContactInfo.firstName, ' ', supplierContactInfo.lastName)",
                'supplierFullName'
            );

            if (inventoryItemID) {
                qb = qb.andWhere('purchase.inventoryItemID = :inventoryItemID', { inventoryItemID });
            }

            if (storeId) {
                qb = qb.andWhere('purchase.storeID = :storeId', { storeId });
            }

            if (supplierID) {
                qb = qb.andWhere('purchase.supplierID = :supplierID', { supplierID });
            }

            if (searchValue) {
                qb = qb.andWhere('inventoryItem.title LIKE :searchValue', { searchValue: `%${searchValue}%` });
            }

            if (sortOrder) {
                if (period) {
                    this.applyStaticPeriodFilter('purchase', qb, period);
                }

                if (sortBy == 'inventory') {
                    qb = qb.orderBy('inventoryItem.title', sortOrder);
                }

                if (sortBy == 'store') {
                    qb = qb.addOrderBy('store.Name', sortOrder);
                }

                if (sortBy == 'supplier') {
                    qb = qb.addOrderBy('supplierFullName', sortOrder);
                }

                if (sortBy == 'purchase_date') {
                    qb = qb.addOrderBy('purchase.purchaseDate', sortOrder);
                }

                if (sortBy == 'expiration_date') {
                    qb = qb.addOrderBy('purchase.expirationDate', sortOrder);
                }
                if (sortBy == 'price') {
                    qb = qb.addOrderBy('purchase.purchasePrice', sortOrder);
                }

                if (sortBy == 'quantity') {
                    qb = qb.addOrderBy('purchase.quantity', sortOrder);
                }

                if (sortBy == 'unit') {
                    qb = qb.addOrderBy('purchase.unit', sortOrder);
                }
            }

            qb = qb.skip((page - 1) * limit).take(limit);

            const purchases = await qb.getMany();
            return purchases;
        } catch (error) {
            throw error;
        }
    }

    async addPurchase(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
        try {
            const { inventoryItemID, storeID, supplierID, ...purchaseData } = createPurchaseDto;

            const inventoryItem = await this.inventoryItemRepository.findOne({ where: { inventoryItemID: inventoryItemID } });
            if (!inventoryItem) {
                throw new NotFoundException(`Inventory item with ID ${inventoryItemID} not found`);
            }


            const store = await this.storesRepository.findOne({ where: { id: storeID } });
            if (!store) {
                throw new NotFoundException(`Store with ID ${storeID} not found`);
            }

            const supplier = await this.supplierRepository.findOne({ where: { id: supplierID } });
            if (!supplier) {
                throw new NotFoundException(`Supplier with ID ${supplierID} not found`);
            }

            const purchase = this.purchaseRepository.create(createPurchaseDto);

            const savedPurchase = await this.purchaseRepository.save(purchase);

            const stockControl = new StockControl();
            stockControl.inventoryItemID = inventoryItem.inventoryItemID;
            stockControl.purchaseID = savedPurchase.purchaseID;
            stockControl.addStock = purchaseData.quantity;
            stockControl.deductStock = 0;

            await this.stockControlRepository.save(stockControl);


            return savedPurchase;
        } catch (error) {
            throw error;
        }
    }

    async updatePurchase(purchaseID: number, updatePurchaseDto: UpdatePurchaseDto): Promise<Purchase> {
        try {
            const purchase = await this.purchaseRepository.findOne({ where: { purchaseID } });
            if (!purchase) {
                throw new NotFoundException(`Purchase with ID ${purchaseID} not found`);
            }

            if (updatePurchaseDto?.inventoryItemID) {
                const inventoryItem = await this.inventoryItemRepository.findOne({ where: { inventoryItemID: updatePurchaseDto.inventoryItemID } });
                if (!inventoryItem) {
                    throw new NotFoundException(`Inventory item with ID ${updatePurchaseDto.inventoryItemID} not found`);
                }
            }

            if (updatePurchaseDto?.storeID) {
                const store = await this.storesRepository.findOne({ where: { id: updatePurchaseDto.storeID } });
                if (!store) {
                    throw new NotFoundException(`Store with ID ${updatePurchaseDto.storeID} not found`);
                }
            }

            if (updatePurchaseDto?.supplierID) {
                const supplier = await this.supplierRepository.findOne({ where: { id: updatePurchaseDto.supplierID } });
                if (!supplier) {
                    throw new NotFoundException(`Supplier with ID ${updatePurchaseDto.supplierID} not found`);
                }
            }

            return await this.purchaseRepository.save({
                ...purchase,
                ...updatePurchaseDto,
            });
        } catch (error) {
            throw error;
        }
    };

    async deletePurchase(purchaseID: number): Promise<void> {
        try {
            const purchase = await this.purchaseRepository.findOneBy({ purchaseID });
            if (!purchase) {
                throw new NotFoundException(`Purchase with ID ${purchaseID} not found`);
            }
            await this.purchaseRepository.delete(purchaseID);
        } catch (error) {
            throw error;
        }
    }

    async deletePurchasesByIds(purchaseIDs: number[]): Promise<void> {
        try {
            const [purchases, count] = await this.purchaseRepository.findAndCount({
                where: {
                    purchaseID: In(purchaseIDs),
                },
            });
            if (count !== purchaseIDs.length) {
                const foundIDs = purchases.map((purchase) => purchase.purchaseID);
                const missingIDs = purchaseIDs.filter(id => !foundIDs.includes(id));
                throw new NotFoundException(`The following IDs do not exist: ${missingIDs.join(', ')}`);
            }
            await this.purchaseRepository.delete(purchaseIDs);
        } catch (error) {
            throw error;
        }
    }
}
