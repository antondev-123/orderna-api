import { HttpStatus } from "@nestjs/common";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { urlsConstant } from "src/common/constants";
import { CreateStoreDto } from "src/store/dtos/create-store.dto";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { CustomersService } from "../src/customer/customer.service";
import { StoresService } from "../src/store/services/stores.service";
import { AuthUtil } from "./utils/auth.util";
import { CreateCustomerDto } from "src/customer/dtos/create-customer.dto";

function createRandomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

describe("CustomersController (e2e)", () => {
	let app: NestFastifyApplication;
	let customersService: CustomersService;
	let storesService: StoresService;
	let createdStoreId: string;
	let authHeader: any;

	async function setupStore(): Promise<any> {
		const createStoreDto: CreateStoreDto = {
			Name: createRandomString(10),
			Location: "Location1",
			Currency: "USD",
			About: "About Store1",
			Email: "store1@example.com",
			mobile: { countryCode: "+63", number: "9876543210" },
			Website: "https://www.store1.com",
			StreetAddress: "123 Main St",
			BuildingNameNumber: "Suite 100",
			City: "City1",
			ZipCode: "12345",
			VATNumber: "VAT12345",
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
		customersService = moduleFixture.get<CustomersService>(CustomersService);
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

	it(`get customer list (GET)`, () => {
		const fromDate = "2024-05-08";
		return request(app.getHttpServer())
			.get(`/customers?fromDate=${fromDate}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body).toBeInstanceOf(Object);
			});
	});

	it(`add customer (POST)`, async () => {
		const createCustomerDto = {
			firstName: "David",
			lastName: "Bob",
			store: createdStoreId,
			mobile: { countryCode: "+63", number: "9876543210" },
		};
		return request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_CUSTOMER}`)
			.set(authHeader)
			.send(createCustomerDto)
			.expect(HttpStatus.CREATED)
			.expect(response => {
				expect(response.body.message).toEqual(["Customer added successfully"]);
				expect(response.body.data.contactInfo.firstName).toEqual("David");
			});
	});

	it(`update customer (PUT)`, async () => {
		const createCustomerDto: any = {
			firstName: "David",
			lastName: "Bob",
			store: createdStoreId,
			mobile: { countryCode: "+63", number: "9876543210" },
		};
		const customer = await customersService.addCustomer(createCustomerDto);
		const editCustomerDto = { firstName: "Updated Customer" };
		const customerIdDto = { customerId: customer["id"] };
		return request(app.getHttpServer())
			.put(`${urlsConstant.ROUTE_PREFIX_CUSTOMER}/${customerIdDto.customerId}`)
			.set(authHeader)
			.send(editCustomerDto)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body.message).toEqual(["Customer updated successfully"]);
				expect(response.body.data.contactInfo.firstName).toEqual("Updated Customer");
			});
	});

	it(`delete customer (DELETE)`, async () => {
		const createCustomerDto: CreateCustomerDto = {
			store: 1,
			firstName: "Jung",
			lastName: "Jungwon",
			company: "Korean restaurant",
			zipCode: 12345,
			city: "Krakow",
			street: "Street",
			mobile: { countryCode: "+63", number: "9876543210" },
			telephone: { countryCode: "+63", number: "123456789" },
			email: "jungwon3@example.com",
			note: "Note",
		};
		const customer = await customersService.addCustomer(createCustomerDto);

		return request(app.getHttpServer())
			.delete(`${urlsConstant.ROUTE_PREFIX_CUSTOMER}/${customer.id}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body.message).toEqual(["Customer deleted successfully"]);
			});
	});

	it(`delete customers (POST)`, async () => {
		const createCustomerDto: any = {
			firstName: "David",
			lastName: "Bob",
			store: createdStoreId,
			mobile: { countryCode: "+63", number: "9876543210" },
		};
		const createCustomerDto1: any = {
			firstName: "David1",
			lastName: "Bob1",
			store: createdStoreId,
			mobile: { countryCode: "+63", number: "9876543211" },
		};
		const customer = await customersService.addCustomer(createCustomerDto);
		const customer1 = await customersService.addCustomer(createCustomerDto1);
		const deleteCustomerDto = { customerIds: [customer["id"], customer1["id"]] };
		return await request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_CUSTOMER}${urlsConstant.API_DELETE_CUSTOMERS}`)
			.set(authHeader)
			.send(deleteCustomerDto)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body.message).toEqual(["Customers deleted successfully"]);
			});
	});

	it(`get customer by id (GET)`, async () => {
		const createCustomerDto: any = {
			firstName: "David",
			lastName: "Bob",
			store: createdStoreId,
			mobile: { countryCode: "+63", number: "9876543210" },
		};
		const customer = await customersService.addCustomer(createCustomerDto);
		const customerIdDto = { customerId: customer["id"] };
		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_CUSTOMER}/${customerIdDto.customerId}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body.data).toHaveProperty("id", customer["id"]);
				expect(response.body.data.contactInfo.firstName).toEqual("David");
			});
	});
});
