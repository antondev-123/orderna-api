import { HttpStatus } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { urlsConstant } from 'src/common/constants';
import { CreateStoreDto } from 'src/store/dtos/create-store.dto';
import { StoresService } from 'src/store/services/stores.service';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ProductIdDto } from '../src/product/dtos/params-product.dto';
import { ProductService } from '../src/product/product.service';
import { AuthUtil } from './utils/auth.util';

function createRandomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

describe('ProductController (e2e)', () => {
	let app: NestFastifyApplication;
	let productService: ProductService;
	let createdStoreId: string;
	let storesService: StoresService;
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

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
		productService = moduleFixture.get<ProductService>(ProductService);
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

	it(`get product list (GET)`, () => {
		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_PRODUCT}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body).toBeInstanceOf(Object);
			});
	});

	it(`add product (POST)`, () => {
		const createProductDto = {
			title: 'Product1',
			cost: 500,
			price: 100,
			unit: 50,
			store: createdStoreId
		};
		return request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_PRODUCT}`)
			.set(authHeader)
			.set('Content-Type', 'multipart/form-data')
			.field('title', createProductDto.title)
			.field('cost', createProductDto.cost)
			.field('price', createProductDto.price)
			.field('unit', createProductDto.unit)
			.field('store', createProductDto.store)
			.attach('file', null)
			.expect(HttpStatus.CREATED)
			.expect(response => {
				expect(response.body.message).toEqual(['Product added successfully']);
				expect(response.body.data.title).toEqual('Product1');
			});
	});

	it(`update product (PUT)`, async () => {
		const createProductDto = {
			title: 'Product1',
			cost: 500,
			price: 100,
			unit: 50,
			store: createdStoreId
		};
		const product = await productService.addProduct(null, createProductDto as any);
		const editProductDto = { title: 'Updated Product' };
		const productIdDto = { productId: product["id"] };
		return request(app.getHttpServer())
			.put(`${urlsConstant.ROUTE_PREFIX_PRODUCT}/${productIdDto.productId}`)
			.set(authHeader)
			.send(editProductDto)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body.message).toEqual(['Product updated successfully']);
				expect(response.body.data.title).toEqual('Updated Product');
			});
	});

	it(`delete product (DELETE)`, async () => {
		const createProductDto = {
			title: 'Product1',
			cost: 500,
			price: 100,
			unit: 50,
			store: createdStoreId
		};
		const product = await productService.addProduct(null, createProductDto as any);
		const productIdDto: ProductIdDto = { productId: product["id"] };
		return request(app.getHttpServer())
			.delete(`${urlsConstant.ROUTE_PREFIX_PRODUCT}/${productIdDto.productId}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body.message).toEqual(['Product deleted successfully']);
			});
	});

	it(`get product by id (GET)`, async () => {
		const createProductDto = {
			title: 'Product1',
			cost: 500,
			price: 100,
			unit: 50,
			store: createdStoreId
		};
		const product = await productService.addProduct(null, createProductDto as any);
		const productIdDto: ProductIdDto = { productId: product["id"] };
		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_PRODUCT}/${productIdDto.productId}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body.message).toEqual(["Product details get successfully"]);
				expect(response.body.data.title).toEqual('Product1');
			});
	});
});
