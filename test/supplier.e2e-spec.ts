import { HttpStatus } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { urlsConstant, UserStatus } from 'src/common/constants';
import { InventoriesService } from 'src/inventory/inventories.service';
import { PurchaseService } from 'src/inventory/purchase/purchase.service';
import { CreateStoreDto } from 'src/store/dtos/create-store.dto';
import { StoresService } from 'src/store/services/stores.service';
import * as request from 'supertest';
import { CreateSupplierDto } from '../src/supplier/dtos/create-supplier.dto';
import { UpdateSupplierDto } from '../src/supplier/dtos/update-supplier.dto';
import { SuppliersService } from '../src/supplier/supplier.service';
import { AuthUtil } from './utils/auth.util';

function createRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

describe('SuppliersController (e2e)', () => {
  let app: NestFastifyApplication;
  let suppliersService: SuppliersService;
  let inventoriesService: InventoriesService;
  let purchasesService: PurchaseService;
  let storesService: StoresService;
  let createdStoreId: number;
  let createdSupplierId: number;
  let authHeader: any;

  async function setupStore(): Promise<number> {
    const createStoreDto: CreateStoreDto = {
      Name: createRandomString(10),
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

    const store = await storesService.create(createStoreDto);
    return store.id; // Return the store ID
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    suppliersService = moduleFixture.get<SuppliersService>(SuppliersService);
    inventoriesService = moduleFixture.get<InventoriesService>(InventoriesService);
    purchasesService = moduleFixture.get<PurchaseService>(PurchaseService);
    storesService = moduleFixture.get<StoresService>(StoresService);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    createdStoreId = await setupStore();

    const authUtil = new AuthUtil(app);
    await authUtil.signUp();
    const response = await authUtil.login();
    authHeader = await authUtil.getAuthToken(response);
  });

  afterAll(async () => {
    await app.close();
  });

  it(`get supplier list (GET)`, () => {
    return request(app.getHttpServer())
      .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}`)
      .set(authHeader)
      .expect(HttpStatus.OK)
      .expect(response => {
        expect(response.body).toBeInstanceOf(Object);
      });
  });

  // it(`get supplier list summary (GET)`, () => {
  //   return request(app.getHttpServer())
  //     .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}${urlsConstant.API_GET_SUPPLIERS_SUMMARY}`)
  //     .set(authHeader)
  //     .expect(HttpStatus.OK)
  //     .expect(response => {
  //       expect(response.body).toBeInstanceOf(Object);
  //     });
  // });

  // describe(`supplier's purchase statistics`, () => {
  //   type PurchaseData = [number, number, Date];
  //   type SupplierStats = {
  //     totalSpentAmount: number,
  //     totalPurchasesCount: number,
  //     lastPurchaseId: Purchase['purchaseID'] | null
  //   };

  //   let createPurchase: (
  //     quantity: Purchase['quantity'],
  //     price: Purchase['purchasePrice'],
  //     date: Purchase['purchaseDate']) =>
  //     Promise<Purchase['purchaseID']>;

  //   async function createSupplier(): Promise<SupplierEntity['id']> {
  //     const dto: CreateSupplierDto = {
  //       storeId: createdStoreId,
  //       supplierFirstName: "John",
  //       supplierLastName: "Doe",
  //       mobile: { countryCode: "+63", number: "9876543210" },
  //     };
  //     const result = await suppliersService.create(dto)
  //     return result.id
  //   }

  //   async function createInventoryItem(): Promise<InventoryItem['inventoryItemID']> {
  //     const dto: CreateInventoryItemDto = {
  //       storeID: createdStoreId,
  //       title: "Cheese",
  //       unit: "kg",
  //       sk_plu: "test sk_plu"
  //     }
  //     const result = await inventoriesService.createInventoryItem(dto)
  //     return result.inventoryItemID;
  //   }

  //   function expectSupplierStats(actual: SupplierStats, expected: SupplierStats) {
  //     expect(actual.totalPurchasesCount).toEqual(expected.totalPurchasesCount);
  //     expect(actual.totalSpentAmount).toEqual(expected.totalSpentAmount);
  //     expect(actual.lastPurchaseId).toEqual(expected.lastPurchaseId);
  //   }

  //   beforeEach(async () => {
  //     const inventoryItemId = await createInventoryItem()
  //     const supplierId = await createSupplier()

  //     createPurchase = async (
  //       quantity: Purchase['quantity'] = 10,
  //       price: Purchase['purchasePrice'] = 100,
  //       date: Purchase['purchaseDate'] = new Date()
  //     ) => {
  //       const dto: CreatePurchaseDto = {
  //         inventoryItemID: inventoryItemId,
  //         supplierID: supplierId,
  //         storeID: createdStoreId,
  //         purchaseDate: date,
  //         expirationDate: new Date(),
  //         purchasePrice: price,
  //         quantity: quantity,
  //         note: 'Dummy note',
  //         unit: UnitEnum.Gram
  //       }
  //       const result = await purchasesService.addPurchase(dto)
  //       return result.purchaseID;
  //     }
  //   })

  // it('supplier with multiple purchases', async () => {
  //   const baseDate = new Date(); // Initialize with the current date

  //   // Create different date objects
  //   const date1 = new Date(baseDate); // Copy of the base date
  //   const date2 = new Date(baseDate);
  //   const date3 = new Date(baseDate);

  //   // Add days to create incrementally larger dates
  //   date2.setDate(date2.getDate() + 1); // Add 1 day to base date
  //   date3.setDate(date3.getDate() + 2); // Add 2 days to base date

  //   const data: PurchaseData[] = [
  //     [10, 100, date1], // Current date
  //     [20, 200, date2], // Current date + 1 day
  //     [30, 300, date3], // Current date + 2 days
  //   ];

  //   // Submit multiple purchases to current supplier
  //   const purchaseIds = await Promise.all(
  //     data.map(([quantity, price, date]) => createPurchase(quantity, price, date))
  //   );

  //   const expectedSupplierStats: SupplierStats = {
  //     totalPurchasesCount: data.reduce((acc, d) => acc + d[0], 0),
  //     totalSpentAmount: data.reduce((acc, d) => acc + d[1], 0),
  //     lastPurchaseId: purchaseIds[purchaseIds.length - 1],
  //   }

  //   const response = await request(app.getHttpServer())
  //     .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}${urlsConstant.API_GET_SUPPLIERS_SUMMARY}`)
  //     .set(authHeader);

  //   expect(response.status).toBe(HttpStatus.OK)
  //   expectSupplierStats(response.body.data.result[0], expectedSupplierStats)
  // });

  // it('supplier with no purchases', async () => {
  //   const expectedSupplierStats: SupplierStats = {
  //     totalPurchasesCount: 0,
  //     totalSpentAmount: 0,
  //     lastPurchaseId: null
  //   }

  //   const response = await request(app.getHttpServer())
  //     .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}${urlsConstant.API_GET_SUPPLIERS_SUMMARY}`)
  //     .set(authHeader);

  //   expect(response.status).toBe(HttpStatus.OK)
  //   expectSupplierStats(response.body.data.result[0], expectedSupplierStats)
  // });

  // it('supplier with 1 purchase', async () => {
  //   const quantity = 10;
  //   const price = 100;
  //   const date = new Date();

  //   // Submit 1 purchase to current supplier
  //   const purchaseId = await createPurchase(quantity, price, date)

  //   const expectedSupplierStats: SupplierStats = {
  //     totalPurchasesCount: quantity,
  //     totalSpentAmount: price,
  //     lastPurchaseId: purchaseId,
  //   }

  //   const response = await request(app.getHttpServer())
  //     .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}${urlsConstant.API_GET_SUPPLIERS_SUMMARY}`)
  //     .set(authHeader);

  //   expect(response.status).toBe(HttpStatus.OK)
  //   expectSupplierStats(response.body.data.result[0], expectedSupplierStats)
  // });

  // it('lastPurchaseId should update when a new purchase is made', async () => {
  //   const baseDate = new Date(); // Initialize with the current date

  //   // Create different date objects
  //   const date1 = new Date(baseDate); // Copy of the base date
  //   const date2 = new Date(baseDate);

  //   const data1: PurchaseData = [10, 100, date1]
  //   const purchaseId1 = await createPurchase(data1[0], data1[1], data1[2])

  //   const response1 = await request(app.getHttpServer())
  //     .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}${urlsConstant.API_GET_SUPPLIERS_SUMMARY}`)
  //     .set(authHeader)

  //   expect(response1.status).toBe(HttpStatus.OK)
  //   expect(response1.body.data.result[0].lastPurchaseId).toBe(purchaseId1)

  //   date2.setDate(date2.getDate() + 1); // Add 1 day to base date
  //   const data2: PurchaseData = [20, 200, date2]
  //   const purchaseId2 = await createPurchase(data2[0], data2[1], data2[2])

  //   const response2 = await request(app.getHttpServer())
  //     .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}${urlsConstant.API_GET_SUPPLIERS_SUMMARY}`)
  //     .set(authHeader)

  //   expect(response2.status).toBe(HttpStatus.OK)
  //   expect(response2.body.data.result[0].lastPurchaseId).toBe(purchaseId2)
  // });

  //   it('lastPurchaseId should not update when new purchase with later purchase date is made', async () => {
  //     const baseDate = new Date(); // Initialize with the current date

  //     // Create different date objects
  //     const date1 = new Date(baseDate); // Copy of the base date
  //     const date2 = new Date(baseDate);

  //     const data1: PurchaseData = [10, 100, date1]
  //     const purchaseId1 = await createPurchase(data1[0], data1[1], data1[2])

  //     const response1 = await request(app.getHttpServer())
  //       .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}${urlsConstant.API_GET_SUPPLIERS_SUMMARY}`)
  //       .set(authHeader)

  //     expect(response1.status).toBe(HttpStatus.OK)
  //     expect(response1.body.data.result[0].lastPurchaseId).toBe(purchaseId1)

  //     date2.setDate(date2.getDate() - 1); // Minus 1 day to base date
  //     const data2: PurchaseData = [20, 200, date2]
  //     const purchaseId2 = await createPurchase(data2[0], data2[1], data2[2])

  //     const response2 = await request(app.getHttpServer())
  //       .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}${urlsConstant.API_GET_SUPPLIERS_SUMMARY}`)
  //       .set(authHeader)

  //     expect(response2.status).toBe(HttpStatus.OK)
  //     expect(response2.body.data.result[0].lastPurchaseId).toBe(purchaseId1)
  //   });
  // })

  it(`add supplier (POST)`, async () => {
    const createSupplierDto: CreateSupplierDto = {
      storeId: createdStoreId,
      status: UserStatus.ACTIVE,
      supplierFirstName: 'Jung',
      supplierLastName: 'Jungwon',
      supplierCompany: 'Korean restaurant',
      supplierZipCode: 12345,
      supplierCity: 'Krakow',
      supplierStreet: 'Street',
      mobile: { countryCode: "+63", number: "9876543210" },
      telephone: { countryCode: "+63", number: "123456789" },
      supplierEmail: 'jungwon1@example.com',
      supplierNote: 'Note',
    };
    return request(app.getHttpServer())
      .post(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}`)
      .send(createSupplierDto)
      .set(authHeader)
      .expect(HttpStatus.CREATED)
      .expect(response => {
        expect(response.body.message).toEqual(['Supplier created successfully']);
        expect(response.body.data.contactInfo.firstName).toEqual('Jung');
        createdSupplierId = response.body.data.supplierID;
      });
  });

  it(`update supplier (PATCH)`, async () => {
    const createSupplierDto: CreateSupplierDto = {
      storeId: createdStoreId,
      status: UserStatus.ACTIVE,
      supplierFirstName: 'Jung',
      supplierLastName: 'Jungwon',
      supplierCompany: 'Korean restaurant',
      supplierZipCode: 12345,
      supplierCity: 'Krakow',
      supplierStreet: 'Street',
      mobile: { countryCode: "+63", number: "9876543210" },
      telephone: { countryCode: "+63", number: "123456789" },
      supplierEmail: 'jungwon2@example.com',
      supplierNote: 'Note',
    };
    const supplier = await suppliersService.create(createSupplierDto);
    const updateSupplierDto: Partial<UpdateSupplierDto> = {
      supplierFirstName: 'Updated Name'
    };

    return request(app.getHttpServer())
      .patch(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}/${supplier.id}`)
      .send(updateSupplierDto)
      .set(authHeader)
      .expect(HttpStatus.OK)
      .then(response => {
        expect(response.body.message).toEqual(['Supplier updated successfully']);
        expect(response.body.data.contactInfo.firstName).toEqual('Updated Name');
      });
  });

  it(`delete supplier (DELETE)`, async () => {
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
      supplierEmail: 'jungwon3@example.com',
      supplierNote: 'Note',
    };
    const supplier = await suppliersService.create(createSupplierDto);

    return request(app.getHttpServer())
      .delete(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}/${supplier.id}`)
      .set(authHeader)
      .expect(HttpStatus.OK)
      .expect(response => {
        expect(response.body.message).toEqual(['Supplier deleted successfully']);
      });
  });

  it(`get supplier by id (GET)`, async () => {
    const createSupplierDto: CreateSupplierDto = {
      storeId: createdStoreId,
      supplierFirstName: 'Jung',
      supplierLastName: 'Jungwon',
      supplierCompany: 'Korean restaurant',
      supplierZipCode: 12345,
      supplierCity: 'Krakow',
      supplierStreet: 'Street',
      mobile: { countryCode: "+63", number: "9876543210" },
      telephone: { countryCode: "+63", number: "123456789" },
      supplierEmail: 'jungwon4@example.com',
      supplierNote: 'Note',
    };

    const supplier = await suppliersService.create(createSupplierDto);

    return request(app.getHttpServer())
      .get(`${urlsConstant.ROUTE_PREFIX_SUPPLIER}/${supplier.id}`)
      .set(authHeader)
      .expect(HttpStatus.OK)
      .then(response => {
        console.log("response.body.data = " + response.body.data);
        expect(response.body.data).toHaveProperty('id', supplier.id);
        expect(response.body.data.contactInfo.firstName).toEqual('Jung');
      });
  });
});
