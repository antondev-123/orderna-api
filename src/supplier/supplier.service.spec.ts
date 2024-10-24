import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { SortOrder, UserStatus } from 'src/common/constants';
import { ContactInformationEntity } from 'src/contact-information/contact-information.entity';
import { Store } from 'src/store/entities/store.entity';
import { StoreRepository } from 'src/store/repository/store.repository';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dtos/create-supplier.dto';
import { FilterSupplierDto } from './dtos/filter-supplier.dto';
import { SupplierDto } from './dtos/supplier.dto';
import { UpdateSupplierDto } from './dtos/update-supplier.dto';
import { SupplierEntity } from './supplier.entity';
import { SuppliersService } from './supplier.service';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let supplierRepository: Repository<SupplierEntity>;
  let contactInfoRepository: Repository<ContactInformationEntity>;
  let storeRepository: StoreRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: getRepositoryToken(ContactInformationEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SupplierEntity),
          useClass: Repository,
        },
        {
          provide: StoreRepository,
          useValue: {
            create: jest.fn(),
            findStoreById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
    contactInfoRepository = module.get<Repository<ContactInformationEntity>>(getRepositoryToken(ContactInformationEntity));
    supplierRepository = module.get<Repository<SupplierEntity>>(getRepositoryToken(SupplierEntity));
    storeRepository = module.get<StoreRepository>(StoreRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new supplier', async () => {
      const store = new Store();
      store.id = 1;
      store.Name = 'SuperMart';
      store.Email = 'info@supermart.com';
      store.mobile = { countryCode: '+63', number: '9876543210' };

      const createSupplierDto: CreateSupplierDto = {
        storeId: 1,
        supplierFirstName: 'Jung',
        supplierLastName: 'Jungwon',
        supplierCompany: 'Korean restaurant',
        supplierZipCode: 12345,
        supplierCity: 'Krakow',
        supplierStreet: 'Street',
        mobile: { countryCode: "+63", number: "9876543210" },
        telephone: { countryCode: "+63", number: "123456789" },
        supplierEmail: 'jungwon@example.com',
        supplierNote: 'Note',
      };

      const contactInformation: ContactInformationEntity = {
        createdAt: new Date(),
        email: createSupplierDto.supplierEmail,
        city: createSupplierDto.supplierCity,
        company: createSupplierDto.supplierCompany,
        firstName: createSupplierDto.supplierFirstName,
        lastName: createSupplierDto.supplierLastName,
        mobile: { countryCode: "+63", number: "9876543210" },
        telephone: { countryCode: "+63", number: "123456789" },
        street: createSupplierDto.supplierStreet,
        zipCode: createSupplierDto.supplierZipCode,
      } as ContactInformationEntity;

      const savedSupplier: SupplierEntity = {
        createdAt: new Date(),
        id: 1,
        store: store,
        contactInfo: contactInformation,
        supplierNote: createSupplierDto.supplierNote
      } as SupplierEntity;

      jest.spyOn(storeRepository, 'findStoreById').mockResolvedValue(store);
      jest.spyOn(contactInfoRepository, 'create').mockReturnValue(contactInformation);
      jest.spyOn(supplierRepository, 'create').mockReturnValue(savedSupplier);
      jest.spyOn(supplierRepository, 'save').mockResolvedValue(savedSupplier);

      const result = await service.create(createSupplierDto);
      expect(result).toEqual(plainToClass(SupplierDto, savedSupplier));
    });
  });

  describe('findAll', () => {
    it('should return an array of suppliers', async () => {
      const suppliers: SupplierEntity[] = [
        {
          id: 1,
          createdAt: new Date(),
          supplierNote: 'Note',
          contactInfo: {
            email: 'jungwon@example.com',
            city: 'Krakow',
            company: 'Korean restaurant',
            firstName: 'Jung',
            lastName: 'Jungwon',
            mobile: { countryCode: "+63", number: "9876543210" },
            telephone: { countryCode: "+63", number: "123456789" },
            street: 'Street',
            zipCode: 12345
          },
        } as SupplierEntity,
      ];

      jest.spyOn(supplierRepository, 'createQueryBuilder').mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([suppliers, 1]),
      }) as any);

      const filter: FilterSupplierDto = {
        sortBy: "firstName",
        sortOrder: SortOrder.ASC,
        searchValue: 'Jung',
        page: 1, limit: 10
      };

      const result = await service.findAll(filter);
      expect(result).toEqual({ result: suppliers.map(supplier => plainToClass(SupplierDto, supplier)), total: suppliers.length },
      )
    });
  });

  describe('findAllSummary', () => {
    it('should return an array of suppliers', async () => {
      const suppliers = [
        {
          id: 1,
          createdAt: new Date(),
          supplierNote: 'Note',
          contactInfo: {
            email: 'jungwon@example.com',
            city: 'Krakow',
            company: 'Korean restaurant',
            firstName: 'Jung',
            lastName: 'Jungwon',
            mobile: { countryCode: "+63", number: "9876543210" },
            telephone: { countryCode: "+63", number: "123456789" },
            street: 'Street',
            zipCode: 12345
          },
        }
      ];

      const purchaseStatistics = {
        totalPurchasesCount: 0,
        totalSpentAmount: 0,
        lastPurchaseId: null
      }

      jest.spyOn(supplierRepository, 'createQueryBuilder').mockImplementation(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(suppliers.length),
        getRawAndEntities: jest.fn().mockResolvedValue({ entities: suppliers, raw: [purchaseStatistics] }),
      }) as any);

      const filter: FilterSupplierDto = {
        sortBy: "firstName",
        sortOrder: SortOrder.ASC,
        searchValue: 'Jung',
        page: 1, limit: 10
      };

      const result = await service.findAllSummary(filter);
      expect(result).toEqual({
        result: suppliers.map((s) => ({ ...s, ...purchaseStatistics })), total: suppliers.length
      })
    });
  });

  describe('findOne', () => {
    it('should return a single supplier', async () => {
      const supplier: SupplierEntity = {
        id: 1,
        createdAt: new Date(),
        supplierNote: 'Note',
        contactInfo: {
          id: 1,
          createdAt: new Date(),
          firstName: 'Jung',
          lastName: 'Jungwon',
          company: 'Korean restaurant',
          zipCode: 12345,
          city: 'Krakow',
          street: 'Street',
          mobile: { countryCode: "+63", number: "9876543210" },
          telephone: { countryCode: "+63", number: "123456789" },
          email: 'jungwon@example.com',
        },
      } as SupplierEntity;

      jest.spyOn(supplierRepository, 'findOne').mockResolvedValue(supplier);

      const result = await service.findOne(1);
      expect(result).toEqual(plainToClass(SupplierDto, supplier));
    });

    it('should throw an error if supplier not found', async () => {
      jest.spyOn(supplierRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findOne((1))).rejects.toThrow(NotFoundException);
    });

  });
  describe('update', () => {
    it('should update a supplier', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        supplierFirstName: 'Jane',
        supplierLastName: 'Doe',
        supplierCompany: 'JD Supplies Updated',
        supplierZipCode: 12345,
        supplierCity: 'City Updated',
        supplierStreet: 'Street Updated',
        mobile: { countryCode: "+63", number: "9876543210" },
        telephone: { countryCode: "+63", number: "123456789" },
        supplierEmail: 'jane.doe@example.com',
        supplierNote: 'Updated Note',
      } as UpdateSupplierDto;

      const contactInfo = {
        id: 1,
        createdAt: new Date(),
        firstName: 'Jung',
        lastName: 'Jungwon',
        company: 'Korean restaurant',
        zipCode: 12345,
        city: 'Krakow',
        street: 'Street',
        mobile: { countryCode: '+63', number: '9876543210' },
        telephone: { countryCode: '+63', number: '123456789' },
        email: 'jungwon@example.com',
      };

      const existingSupplier = {
        store: 1,
        supplierID: 1,
        status: UserStatus.ACTIVE,
        contactInfo: contactInfo,
        supplierNote: 'Note',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue({
          ...updateSupplierDto,
          supplierID: 1,
          createdAt: new Date(),
        }),
      } as unknown as SupplierEntity;


      jest.spyOn(contactInfoRepository, 'create').mockReturnValue(contactInfo as any);
      jest.spyOn(supplierRepository, 'findOne').mockResolvedValue(existingSupplier as any);
      jest.spyOn(supplierRepository, 'save').mockResolvedValue({
        ...existingSupplier,
      } as SupplierEntity);

      const result = await service.update(1, updateSupplierDto);
      expect(result).toEqual(plainToClass(
        SupplierDto,
        {
          ...existingSupplier,
        }
      ),);
    });

    it('should throw an error if supplier not found', async () => {
      jest.spyOn(supplierRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update(1, {} as UpdateSupplierDto)).rejects.toThrow(NotFoundException);
    })
  });

  describe('remove', () => {
    it('should remove a supplier', async () => {
      const supplier: SupplierEntity = {
        id: 1,
        createdAt: new Date(),
        supplierNote: 'Note',
        contactInfo: {
          id: 1,
          createdAt: new Date(),
          firstName: 'Jung',
          lastName: 'Jungwon',
          company: 'Korean restaurant',
          zipCode: 12345,
          city: 'Krakow',
          street: 'Street',
          mobile: { countryCode: "+63", number: "9876543210" },
          telephone: { countryCode: "+63", number: "123456789" },
          email: 'jungwon@example.com',
        },
      } as SupplierEntity;

      jest.spyOn(supplierRepository, 'findOne').mockResolvedValue(supplier);
      jest.spyOn(supplierRepository, 'remove').mockResolvedValue(supplier);

      // await expect(service.remove(1)).resolves.toEqual(supplier);
      expect(await service.remove(1)).toEqual(supplier);
    });

    it('should throw an error if supplier not found', async () => {
      jest.spyOn(supplierRepository, 'findOne').mockResolvedValue(null);
      const removeSpy = jest.spyOn(supplierRepository, 'remove');

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(removeSpy).not.toHaveBeenCalled();
    });
  });


  describe('bulkRemove', () => {
    it('should bulk remove suppliers', async () => {
      const suppliers: SupplierEntity[] = [
        {
          id: 1,
          createdAt: new Date(),
          supplierNote: 'Note',
          contactInfo: {
            id: 1,
            createdAt: new Date(),
            firstName: 'Jung',
            lastName: 'Jungwon',
            company: 'Korean restaurant',
            zipCode: 12345,
            city: 'Krakow',
            street: 'Street',
            mobile: { countryCode: "+63", number: "9876543210" },
            telephone: { countryCode: "+63", number: "123456789" },
            email: 'jungwon@example.com',
          },
        } as SupplierEntity
      ];

      jest.spyOn(supplierRepository, 'findBy').mockResolvedValue(suppliers);
      const removeMock = jest.spyOn(supplierRepository, 'remove').mockResolvedValue(undefined);

      // await expect(service.bulkRemove([1])).resolves.toBeUndefined();
      expect(await service.bulkRemove([1])).toEqual(suppliers);
      suppliers.forEach(supplier => {
        expect(removeMock).toHaveBeenCalledWith([supplier]);
      });
      expect(removeMock).toHaveBeenCalledTimes(suppliers.length);
    });

    it('should throw an error if no suppliers found', async () => {
      jest.spyOn(supplierRepository, 'findBy').mockResolvedValue([]);

      await expect(service.bulkRemove([1])).rejects.toThrow(NotFoundException);
      // expect(await service.bulkRemove([1])).toEqual({
      //   statusCode: HttpStatus.NOT_FOUND,
      //   data: {},
      //   message: ["Suppliers not found"],
      // });
    });
  });
});