import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnitEnum } from 'src/common/constants';
import { Repository } from 'typeorm';
import { Store } from '../../store/entities/store.entity';
import { SupplierEntity } from '../../supplier/supplier.entity';
import { InventoryItem } from '../inventories.entity';
import { StockControl } from '../stock-control.entity';
import { PurchaseFilterDto } from './dtos/filter-purchase.dto';
import { CreatePurchaseDto, UpdatePurchaseDto } from './dtos/purchase.dto';
import { Purchase } from './purchase.entity';
import { PurchaseService } from './purchase.service';

describe('PurchaseService', () => {
    let service: PurchaseService;
    let purchaseRepository: Repository<Purchase>;
    let inventoryItemRepository: Repository<InventoryItem>;
    let storesRepository: Repository<Store>;
    let supplierRepository: Repository<SupplierEntity>;
    let stockControlRepository: Repository<StockControl>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PurchaseService,
                {
                    provide: getRepositoryToken(Purchase),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(InventoryItem),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Store),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(SupplierEntity),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(StockControl),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<PurchaseService>(PurchaseService);
        purchaseRepository = module.get<Repository<Purchase>>(getRepositoryToken(Purchase));
        inventoryItemRepository = module.get<Repository<InventoryItem>>(getRepositoryToken(InventoryItem));
        storesRepository = module.get<Repository<Store>>(getRepositoryToken(Store));
        supplierRepository = module.get<Repository<SupplierEntity>>(getRepositoryToken(SupplierEntity));
        stockControlRepository = module.get<Repository<StockControl>>(getRepositoryToken(StockControl));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getPurchases', () => {
        it('should return an array of purchases', async () => {
            const mockPurchases = [{ purchaseID: 1, quantity: 10, purchasePrice: 100 } as Purchase];
            jest.spyOn(purchaseRepository, 'createQueryBuilder').mockReturnValue({
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                addOrderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue(mockPurchases),
            } as any);

            const result = await service.getPurchases({ page: 1, limit: 10 } as PurchaseFilterDto);
            expect(result).toEqual(mockPurchases);
        });
    });

    describe('addPurchase', () => {
        it('should add a purchase and return it', async () => {
            const createPurchaseDto: CreatePurchaseDto = {
                inventoryItemID: 1,
                storeID: 1,
                supplierID: 1,
                purchaseDate: new Date(),
                expirationDate: new Date(),
                purchasePrice: 100,
                quantity: 10,
                unit: UnitEnum.Centimeter,
                note: "Yes"
            };

            const mockPurchase = { purchaseID: 1, ...createPurchaseDto } as Purchase;
            const mockInventoryItem = { inventoryItemID: 1 } as InventoryItem;
            const mockStore = { id: 1 } as Store;
            const mockSupplier = { id: 1 } as SupplierEntity;

            jest.spyOn(inventoryItemRepository, 'findOne').mockResolvedValue(mockInventoryItem);
            jest.spyOn(storesRepository, 'findOne').mockResolvedValue(mockStore);
            jest.spyOn(supplierRepository, 'findOne').mockResolvedValue(mockSupplier);
            jest.spyOn(purchaseRepository, 'create').mockReturnValue(mockPurchase);
            jest.spyOn(purchaseRepository, 'save').mockResolvedValue(mockPurchase);
            jest.spyOn(stockControlRepository, 'save').mockResolvedValue({} as StockControl);

            const result = await service.addPurchase(createPurchaseDto);
            expect(result).toEqual(mockPurchase);
        });

        it('should throw NotFoundException if inventory item not found', async () => {
            const createPurchaseDto: CreatePurchaseDto = { inventoryItemID: 1, storeID: 1, supplierID: 1, purchaseDate: new Date(), expirationDate: new Date(), purchasePrice: 100, quantity: 10, unit: UnitEnum.Centimeter, note: "Yes" };
            jest.spyOn(inventoryItemRepository, 'findOne').mockResolvedValue(null);

            await expect(service.addPurchase(createPurchaseDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updatePurchase', () => {
        it('should update and return the purchase', async () => {
            const updatePurchaseDto: UpdatePurchaseDto = {
                quantity: 20,
                inventoryItemID: 0,
                storeID: 0,
                supplierID: 0,
                purchaseDate: undefined,
                expirationDate: undefined,
                purchasePrice: 0,
                note: ''
            };
            const existingPurchase = { purchaseID: 1, quantity: 10 } as Purchase;
            const updatedPurchase = { purchaseID: 1, quantity: 20 } as Purchase;

            jest.spyOn(purchaseRepository, 'findOne').mockResolvedValue(existingPurchase);
            jest.spyOn(purchaseRepository, 'save').mockResolvedValue(updatedPurchase);

            const result = await service.updatePurchase(1, updatePurchaseDto);
            expect(result).toEqual(updatedPurchase);
        });

        it('should throw NotFoundException if purchase not found', async () => {
            const updatePurchaseDto: UpdatePurchaseDto = {
                quantity: 20,
                inventoryItemID: 0,
                storeID: 0,
                supplierID: 0,
                purchaseDate: undefined,
                expirationDate: undefined,
                purchasePrice: 0,
                note: ''
            };
            jest.spyOn(purchaseRepository, 'findOne').mockResolvedValue(null);

            await expect(service.updatePurchase(1, updatePurchaseDto)).rejects.toThrow(NotFoundException);
        });
    });

});
