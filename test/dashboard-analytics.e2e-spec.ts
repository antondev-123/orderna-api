import { HttpStatus } from "@nestjs/common";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { FilterPeriod, SortOrder, urlsConstant } from "src/common/constants";
import { CreateStoreDto } from "src/store/dtos/create-store.dto";
import { StoresService } from "src/store/services/stores.service";
import { TransactionService } from "src/transaction/transaction.service";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { AuthUtil } from "./utils/auth.util";

function createRandomString(length: number): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

describe("DashboardAnalyticsController (e2e)", () => {
	let app: NestFastifyApplication;
	let storesService: StoresService;
	let transactionService: TransactionService;
	let createdStoreId: string;
	let authHeader: any;

	async function setupStore(): Promise<any> {
		const createStoreDto: CreateStoreDto = {
			Name: createRandomString(10),
			Location: "Location1",
			Currency: "USD",
			About: "About Store1",
			Email: "store1@example.com",
			Website: "https://www.store1.com",
			StreetAddress: "123 Main St",
			BuildingNameNumber: "Suite 100",
			City: "City1",
			ZipCode: "12345",
			VATNumber: "VAT12345",
			IsOpen: true,
			mobile: { countryCode: "+63", number: "9876543210" },
			telephone: { countryCode: "+63", number: "123456789" },
		};

		const store = await storesService.create(createStoreDto);
		return store.id;
	}

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
		storesService = moduleFixture.get<StoresService>(StoresService);
		transactionService = moduleFixture.get<TransactionService>(TransactionService);
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

	it(`should return sales summary (GET)`, () => {
		const period = FilterPeriod.LAST_7_DAYS;

		return request(app.getHttpServer())
			.get(
				`${urlsConstant.ROUTE_PREFIX_DASHBOARD_ANALYTICS}${urlsConstant.API_GET_DASHBOARD_SALES_SUMMARY}?period=${period}&storeId=${createdStoreId}`,
			)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body).toHaveProperty("statusCode", HttpStatus.OK);
				expect(response.body).toHaveProperty("data");
			});
	});

	it(`should return total sales (GET)`, () => {
		const period = FilterPeriod.LAST_7_DAYS;

		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_DASHBOARD_ANALYTICS}${urlsConstant.API_GET_DASHBOARD_TOTAL_SALES}?period=${period}&storeId=${createdStoreId}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body).toHaveProperty("statusCode", HttpStatus.OK);
				expect(response.body).toHaveProperty("data");
			});
	});

	it(`should compare stores (GET)`, () => {
		const period = FilterPeriod.LAST_7_DAYS;
		const storeIds = [createdStoreId];

		return request(app.getHttpServer())
			.get(
				`${urlsConstant.ROUTE_PREFIX_DASHBOARD_ANALYTICS}${urlsConstant.API_GET_DASHBOARD_COMPARE_STORES}?baseStoreId=${createdStoreId}&storeId=${storeIds[0]}&period=${period}`,
			)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body).toHaveProperty("statusCode", HttpStatus.OK);
				expect(response.body).toHaveProperty("data");
			});
	});

	it(`should return best sellers (GET)`, () => {
		const period = FilterPeriod.LAST_7_DAYS;
		const sortOrder = SortOrder.DESC;

		return request(app.getHttpServer())
			.get(
				`${urlsConstant.ROUTE_PREFIX_DASHBOARD_ANALYTICS}${urlsConstant.API_GET_BEST_SELLERS}?storeId=${createdStoreId}&sortOrder=${sortOrder}&period=${period}`,
			)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body).toHaveProperty("statusCode", HttpStatus.OK);
				expect(response.body).toHaveProperty("data");
			});
	});
});
