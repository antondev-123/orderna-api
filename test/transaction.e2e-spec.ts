import { HttpStatus } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentType, TransactionStatus, TransactionType, urlsConstant, UserRole } from 'src/common/constants';
import { ProductService } from 'src/product/product.service';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateStoreDto } from '../src/store/dtos/create-store.dto';
import { StoresService } from '../src/store/services/stores.service';
import { TransactionService } from '../src/transaction/transaction.service';
import { CreateUserDto } from '../src/user/dtos/create.user.dto';
import { UsersService } from '../src/user/users.service';
import { AuthUtil } from './utils/auth.util';

function createRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateRandomMobileNumber() {
  const prefix = '9';
  let number = prefix;
  for (let i = 0; i < 9; i++) {
    const digit = Math.floor(Math.random() * 10);
    number += digit;
  }
  return number;
}

function generateRandomEmail() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const usernameLength = 10;
  let username = '';
  for (let i = 0; i < usernameLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    username += characters[randomIndex];
  }
  return `${username}@test.com`;
}

describe('TransactionController (e2e)', () => {
  let app: NestFastifyApplication;
  let storesService: StoresService;
  let transactionService: TransactionService;
  let usersService: UsersService;
  let productService: ProductService;
  let createdStoreId: string;
  let createUserDto: Partial<CreateUserDto>;
  let tokenPayload: any;
  let staff: any;
  let authHeader: any;

  async function setupStore(): Promise<any> {
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

  async function setupUser(): Promise<any> {
    createUserDto = {
      firstName: createRandomString(10),
      lastName: createRandomString(10),
      mobile: { countryCode: '+63', number: generateRandomMobileNumber() },
      email: generateRandomEmail(),
      role: UserRole.ADMIN,
    }

    tokenPayload = {
      object: createUserDto,
    };

    const result = await usersService.addUser(createUserDto as any, tokenPayload)
    return result;
  }

  beforeEach(async () => {

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    storesService = moduleFixture.get<StoresService>(StoresService);
    productService = moduleFixture.get<ProductService>(ProductService);
    transactionService = moduleFixture.get<TransactionService>(TransactionService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    createdStoreId = await setupStore();

    const authUtil = new AuthUtil(app);
    await authUtil.signUp();
    const response = await authUtil.login();
    authHeader = await authUtil.getAuthToken(response);
  });

  beforeEach(async () => {
    staff = await setupUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`add transaction (POST)`, async () => {
    const createProductDto = {
      title: 'Product1',
      cost: 500,
      price: 100,
      unit: 50,
      store: createdStoreId
    };

    const file = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test content'),
    } as any;

    const product = await productService.addProduct(file, createProductDto as any);
    const createTransactionDto = {
      store: createdStoreId,
      staff: staff.id,
      salesTaxRate: 30,
      transactionDate: '2024-05-08',
      paymentType: PaymentType.CASH,
      status: TransactionStatus.APPROVED,
      type: TransactionType.ONLINE,
      item: [
        {
          product: product["id"],
          quantity: 2,
          isRefund: true
        }
      ]
    };

    return request(app.getHttpServer())
      .post(`${urlsConstant.ROUTE_PREFIX_TRANSACTION}`)
      .set(authHeader)
      .send(createTransactionDto)
      .expect(HttpStatus.CREATED)
      .expect(response => {
        expect(response.body.message).toEqual(['Transaction added successfully']);
      });
  });

  it(`update transaction (PUT)`, async () => {
    const createProductDto = {
      title: 'Product1',
      cost: 500,
      price: 100,
      unit: 50,
      store: createdStoreId
    };
    const file = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test content'),
    } as any;

    const product = await productService.addProduct(file, createProductDto as any);
    const createTransactionDto = {
      store: createdStoreId,
      salesTaxRate: 30,
      staff: staff.id,
      transactionDate: '2024-05-08',
      paymentType: PaymentType.CASH,
      status: TransactionStatus.APPROVED,
      type: TransactionType.ONLINE,
      item: [
        {
          product: product["id"],
          quantity: 2,
          isRefund: true
        }
      ]
    };
    const transaction = await transactionService.addTransaction(createTransactionDto as any)
    const transactionIdDto = { transactionId: transaction["id"] };
    const editTransactionDto = {
      salesTaxRate: 20
    };
    return request(app.getHttpServer())
      .put(`${urlsConstant.ROUTE_PREFIX_TRANSACTION}/${transactionIdDto.transactionId}`)
      .set(authHeader)
      .send(editTransactionDto)
      .expect(HttpStatus.OK)
      .expect(response => {
        expect(response.body.message).toEqual(['Transaction updated successfully']);
        expect(response.body.data.salesTaxRate).toBe(editTransactionDto.salesTaxRate);
      });
  });

  it(`delete transaction (DELETE)`, async () => {
    const createProductDto = {
      title: 'Product1',
      cost: 500,
      price: 100,
      unit: 50,
      store: createdStoreId
    };
    const file = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test content'),
    } as any;

    const product = await productService.addProduct(file, createProductDto as any);
    const createTransactionDto = {
      store: createdStoreId,
      salesTaxRate: 30,
      staff: staff.id,
      transactionDate: '2024-05-08',
      paymentType: PaymentType.CASH,
      status: TransactionStatus.APPROVED,
      type: TransactionType.ONLINE,
      item: [
        {
          product: product["id"],
          quantity: 2,
          isRefund: true
        }
      ]
    };
    const transaction = await transactionService.addTransaction(createTransactionDto as any)
    const transactionIdDto = { transactionId: transaction["id"] };
    return request(app.getHttpServer())
      .delete(`${urlsConstant.ROUTE_PREFIX_TRANSACTION}/${transactionIdDto.transactionId}`)
      .set(authHeader)
      .expect(HttpStatus.OK)
      .expect(response => {
        expect(response.body.message).toEqual(['Transaction deleted successfully']);
      });
  });

  it(`delete multiple transactions (POST)`, async () => {
    const createProductDto = {
      title: 'Product1',
      cost: 500,
      price: 100,
      unit: 50,
      store: createdStoreId
    };
    const file = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test content'),
    } as any;

    const product = await productService.addProduct(file, createProductDto as any);
    const createTransactionDto = {
      store: createdStoreId,
      salesTaxRate: 30,
      staff: staff.id,
      transactionDate: '2024-05-08',
      paymentType: PaymentType.CASH,
      status: TransactionStatus.APPROVED,
      type: TransactionType.ONLINE,
      item: [
        {
          product: product["id"],
          quantity: 2,
          isRefund: true
        }
      ]
    };
    const transaction = await transactionService.addTransaction(createTransactionDto as any)
    const deleteTransactionDto = { ids: [transaction["id"]] };
    return await request(app.getHttpServer())
      .post(`${urlsConstant.ROUTE_PREFIX_TRANSACTION}${urlsConstant.API_DELETE_TRANSACTIONS}`)
      .set(authHeader)
      .send(deleteTransactionDto)
      .expect(HttpStatus.OK)
      .expect(response => {
        expect(response.body.message).toEqual(['Transactions deleted successfully']);
      });
  });

  it(`get list of transactions (GET)`, async () => {
    const fromDate = "2024-05-08"
    return request(app.getHttpServer())
      .get(`${urlsConstant.ROUTE_PREFIX_TRANSACTION}?fromDate=${fromDate}`)
      .set(authHeader)
      .expect(HttpStatus.OK)
      .expect(response => {
        expect(response.body.data).toHaveProperty('transaction');
        expect(response.body.data).toHaveProperty('total_record');
        expect(response.body.message).toEqual(['Transaction list get successfully']);
      });
  });

  it(`get transaction by id (GET)`, async () => {
    const createProductDto = {
      title: 'Product1',
      cost: 500,
      price: 100,
      unit: 50,
      store: createdStoreId
    };
    const file = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test content'),
    } as any;

    const product = await productService.addProduct(file, createProductDto as any);
    const createTransactionDto = {
      store: createdStoreId,
      salesTaxRate: 30,
      staff: staff.id,
      transactionDate: '2024-05-08',
      paymentType: PaymentType.CASH,
      status: TransactionStatus.APPROVED,
      type: TransactionType.ONLINE,
      item: [
        {
          product: product["id"],
          quantity: 2,
          isRefund: true
        }
      ]
    };
    const transaction = await transactionService.addTransaction(createTransactionDto as any)
    const transactionIdDto = { transactionId: transaction["id"] };
    return request(app.getHttpServer())
      .get(`${urlsConstant.ROUTE_PREFIX_TRANSACTION}/${transactionIdDto.transactionId}`)
      .set(authHeader)
      .expect(HttpStatus.OK)
      .expect(response => {
        expect(response.body.message).toEqual(['Transaction details get successfully']);
      });
  });
});