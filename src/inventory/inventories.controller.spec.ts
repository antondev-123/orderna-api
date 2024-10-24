import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRedisService } from 'src/redis/services/auth-redis.service';
import { InventoriesController } from './inventories.controller';
import { BulkDeleteInventoryItemsResultDto, CreateInventoryItemDto, DeleteInventoryItemResultDto, EditInventoryItemDto, FilterInventoryDto } from './inventories.dto';
import { InventoryItem } from './inventories.entity';
import { InventoriesService } from './inventories.service';

describe('InventoriesController', () => {
  let controller: InventoriesController;
  let fakeInventoriesService: Partial<InventoriesService>;

  beforeEach(async () => {
    fakeInventoriesService = {
      getInventories: (dto: FilterInventoryDto) => {
        let result = {} as Partial<InventoryItem>[];
        if (dto?.page >= 0 && dto?.pageSize >= 10) {
          result = [
            {
              inventoryItemID: 1,
              storeID: 111,
              title: 'test inventory',
              unit: 'kg',
              createdAt: new Date(),
              updatedAt: new Date(),
              sk_plu: 'test sk_plu'
            },];

        } else if (dto?.page >= 0 && dto?.pageSize >= 10) {
          result = [];
        } else {
          result = [];
        }
        return Promise.resolve(result as InventoryItem[]);
      },
      createInventoryItem: (dto: CreateInventoryItemDto) => {
        let result = {} as Partial<InventoryItem>;
        if (dto?.unit && dto?.title && dto?.sk_plu && dto?.storeID) {
          result = {
            inventoryItemID: 1,
            sk_plu: dto.sk_plu,
            title: dto?.title,
            storeID: dto?.storeID,
            unit: dto?.unit,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        } else {
          result = null
        }
        return Promise.resolve(result as InventoryItem);
      },
      editInventoryItem: (inventoryID: number, dto: EditInventoryItemDto) => {
        let result = {} as Partial<InventoryItem>;
        let invetoriesIDArr = [1, 2, 3];
        if (inventoryID && invetoriesIDArr.includes(inventoryID)) {
          result = {
            inventoryItemID: inventoryID,
            storeID: dto.storeID,
            title: dto.title,
            unit: dto.unit,
            sk_plu: dto.sk_plu,
            createdAt: new Date('01-01-2020'),
            updatedAt: new Date()
          }
        } else {
          result = null;
        }
        return Promise.resolve(result as InventoryItem);
      },
      deleteInventoryItem: (inventoryID: number): Promise<void> => {
        let result = {} as DeleteInventoryItemResultDto;
        let inventoriesIDArr = [1, 2, 3]
        if (inventoryID && inventoriesIDArr.includes(inventoryID)) {
          result = {
            message: `Inventory with ID: ${inventoryID} Successfully deleted`,
            status: true
          }
        } else {
          result = {
            message: `Inventory with ID: ${inventoryID} Failed to delete`,
            status: false
          }
        }
        return Promise.resolve();
      },
      bulkDeleteInventoryItems: (inventoryIds: number[]): Promise<void> => {
        let result = {} as BulkDeleteInventoryItemsResultDto;
        let inventoriesIDArr = [1, 2, 3];
        let exist = false;
        inventoryIds.forEach(inventoryId => {
          inventoriesIDArr.includes(inventoryId) ? exist = true : '';
        })

        if (exist) {
          result = {
            message: `Inventory with ID: ${inventoryIds.join(' , ')} Successfully deleted`,
            status: true
          }
        } else {
          result = {
            message: `Inventory with ID: ${inventoryIds.join(' , ')} Failed to delete`,
            status: false
          }
        }
        return Promise.resolve();
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoriesController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuthRedisService,
          useValue: {
            saveTokenToRedis: jest.fn(),
            getTokenFromRedis: jest.fn(),
            deleteTokenFromRedis: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: InventoriesService,
          useValue: fakeInventoriesService,
        },
      ],
    }).compile();

    controller = module.get<InventoriesController>(InventoriesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("Filter Inventories with page and page size-> should be a object with properties: message, status = true , object = an array of InventoryItem", async () => {
    const result = await controller.getInventories({ page: 0, pageSize: 10 })
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('inventoryItemID');
  });

  it("Filter Inventories with page and invalid page size -> should be a object with properties: message, status = false , object = null", async () => {
    expect(await controller.getInventories({ page: 0, pageSize: 5 })).toEqual([]);
  });

  it("Create Inventory Item -> should be a object with properties: message, status = true , object = InvetoryItem Object", async () => {
    expect(await controller.createInventory({ storeID: 111, title: 'unit test', unit: 'kg', sk_plu: 'unit test' })).toHaveProperty('inventoryItemID', 1);
  });

  it("Create Inventory Item without at least one property -> should be a object with properties: message, status = false , object = null", async () => {
    expect(await controller.createInventory({ storeID: 111, title: 'unit test', unit: 'kg', sk_plu: null })).toEqual(null);
  });

  it("Edit Inventory Item -> should be a object with properties: message, status = true , object = InventoryItem Schema", async () => {
    expect(await controller.editInventory(1, { storeID: 111, title: 'unit test', unit: 'kg', sk_plu: 'sk_plu' })).toHaveProperty('inventoryItemID', 1);
  });

  it("Delete Inventory Item single item -> should be a object with properties: message, status = true", async () => {
    expect(await controller.deleteInventory(1)).toBe(undefined);
  });

  it("Delete Inventory Item bulk -> should be a object with properties: message, status = true", async () => {
    expect(await controller.bulkDeleteInventories([1, 2])).toBe(undefined);
  });

});
