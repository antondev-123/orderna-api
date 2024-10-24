import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryItem } from 'src/inventory/inventories.entity';
import { PurchaseFilterDto } from 'src/inventory/purchase/dtos/filter-purchase.dto';
import { Purchase } from 'src/inventory/purchase/purchase.entity';
import { PurchaseService } from 'src/inventory/purchase/purchase.service';
import { StockControl } from 'src/inventory/stock-control.entity';
import { Store } from 'src/store/entities/store.entity';
import { SupplierEntity } from 'src/supplier/supplier.entity';
import { Repository } from 'typeorm';

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

        it('should return an empty array if no purchases found', async () => {
            jest.spyOn(purchaseRepository, 'createQueryBuilder').mockReturnValue({
                leftJoinAndSelect: jest.fn().mockReturnThis(),
                addSelect: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                addOrderBy: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                take: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            } as any);

            const result = await service.getPurchases({ page: 1, limit: 10 } as PurchaseFilterDto);
            expect(result).toEqual([]);
        });
    });
});