import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRedisService } from 'src/redis/services/auth-redis.service';
import { CreateStoreDto } from '../dtos/create-store.dto';
import { UpdateStoreDto } from '../dtos/update-store.dto';
import { Store } from '../entities/store.entity';
import { StoresService } from '../services/stores.service';
import { StoresController } from './stores.controller';

describe('StoresController', () => {
  let controller: StoresController;
  let fakeStoresService: Partial<StoresService>;

  beforeEach(async () => {
    fakeStoresService = {
      findAll: (search: string, page: number, limit: number) => {
        return Promise.resolve([{ id: 1, Name: 'Store1', Location: 'Location1' } as Store]);
      },
      findOne: (id: number) => {
        return Promise.resolve({ id, Name: 'Store1', Location: 'Location1' } as Store);
      },
      create: (createStoreDto: CreateStoreDto) => {
        return Promise.resolve({
          id: 1,
          ...createStoreDto,
        } as Store);
      },
      update: (id: number, updateStoreDto: UpdateStoreDto) => {
        return Promise.resolve({
          id,
          ...updateStoreDto,
        } as Store);
      },
      remove: (id: number) => {
        return Promise.resolve();
      },
      removeBulk: (ids: number[]) => {
        return Promise.resolve();
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: StoresService,
          useValue: fakeStoresService,
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
          provide: AuthRedisService,
          useValue: {
            saveTokenToRedis: jest.fn(),
            getTokenFromRedis: jest.fn(),
            deleteTokenFromRedis: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StoresController>(StoresController);
  });

  it('should be there', () => {
    expect(controller).toBeDefined();
  });

  it('findAll stores', async () => {
    const stores = await controller.findAll('search', 1, 10);
    expect(stores.length).toBe(1);
    expect(stores[0].Name).toBe('Store1');
  });

  it('findOne store', async () => {
    const store = await controller.findOne('1');
    expect(store).toBeDefined();
    expect(store.id).toBe(1);
  });


  it('create store', async () => {
    const createStoreDto: CreateStoreDto = {
      Name: 'Store1',
      Location: 'Location1',
      Currency: 'USD',
      About: 'About Store1',
      Email: 'store1@example.com',
      mobile: { countryCode: "+63", number: "9876543210" },
      Website: 'https://www.store1.com',
      StreetAddress: '123 Main St',
      BuildingNameNumber: 'Suite 100',
      City: 'City1',
      ZipCode: '12345',
      VATNumber: 'VAT12345',
      IsOpen: true,
    };
    const store = await controller.create(createStoreDto);
    expect(store).toBeDefined();
    expect(store.Name).toBe('Store1');
  });

  it('update store', async () => {
    const updateStoreDto: UpdateStoreDto = {
      Name: 'Updated Store1',
      Location: 'Updated Location1',
      Currency: 'EUR',
      About: 'Updated About Store1',
      Email: 'updated@example.com',
      PhoneNumber: '0987654321',
      Website: 'https://www.updatedstore1.com',
      StreetAddress: '456 Main St',
      BuildingNameNumber: 'Suite 200',
      City: 'Updated City1',
      ZipCode: '54321',
      VATNumber: 'VAT54321',
      IsOpen: false,
    };
    const store = await controller.update('1', updateStoreDto);
    expect(store).toBeDefined();
    expect(store.Name).toBe('Updated Store1');
  });

  it('remove store', async () => {
    await expect(controller.remove('1')).resolves.toBeUndefined();
  });

  it('removeBulk stores', async () => {
    await expect(controller.removeBulk([1, 2, 3])).resolves.toBeUndefined();
  });
});
