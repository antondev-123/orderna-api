import { HttpStatus } from "@nestjs/common";
import {
	FastifyAdapter,
	NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { errorResponseMessage, inventoryResponseMessage, urlsConstant } from "src/common/constants";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { AuthUtil } from "./utils/auth.util";

describe("Inventories (e2e)", () => {
	let app: NestFastifyApplication;
	let authHeader: any;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(
			new FastifyAdapter(),
		);
		await app.init();
		await app.getHttpAdapter().getInstance().ready();

		const authUtil = new AuthUtil(app);
		await authUtil.signUp();
		const response = await authUtil.login();
		authHeader = await authUtil.getAuthToken(response);
	});

	afterAll(async () => {
		await app.close();
	});

	it("/inventories (GET) without any query (default page 0 and pageSize 10) -> should be JSON with status true and object with InventoryItem Schema", () => {
		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(({ body }) => {
				expect(body.message).toEqual([inventoryResponseMessage.GET_INVENTORYS.EN]);
				expect(body.data).toBeInstanceOf(Array);
			});
	});

	it("/inventories (GET) with page and pageSize -> should be JSON with status true and object with InventoryItem Schema", () => {
		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.query({ page: 0, pageSize: 10 })
			.expect(HttpStatus.OK)
			.expect(({ body }) => {
				expect(body.message).toEqual([inventoryResponseMessage.GET_INVENTORYS.EN]);
				expect(body.data).toBeInstanceOf(Array);
			});
	});

	it("/inventories (GET) with page, pageSize, sortBy, sortType -> should be JSON with status true and object with InventoryItem Schema", () => {
		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.query({ page: 0, pageSize: 10, sortBy: 'storeID', sortType: 'DESC' })
			.expect(HttpStatus.OK)
			.expect(({ body }) => {
				expect(body.message).toEqual([inventoryResponseMessage.GET_INVENTORYS.EN]);
				expect(body.data).toBeInstanceOf(Array);
			});
	});

	it("/inventories (GET) with page, pageSize, sortBy, sortType, filterType period, limitDate -> should be JSON with status true and object with InventoryItem Schema", () => {
		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.query({ page: 0, pageSize: 10, sortBy: 'storeID', sortType: 'DESC', filterType: 'period', limitDate: 7 })
			.expect(HttpStatus.OK)
			.expect(({ body }) => {
				expect(body.message).toEqual([inventoryResponseMessage.GET_INVENTORYS.EN]);
				expect(body.data).toBeInstanceOf(Array);
			});
	});

	it("/inventories (GET) with page, pageSize, sortBy, sortType, filterType period, without limitDate or wrong -> should be JSON with status false and object null", () => {
		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.query({ page: 0, pageSize: 10, sortBy: 'storeID', sortType: 'DESC', filterType: 'period', limitDate: 0 })
			.expect(HttpStatus.BAD_REQUEST)
			.expect(({ body }) => {
				expect(body.message).toEqual(inventoryResponseMessage.BAD_REQUEST_UNEXPECTED_FILTER_RESULT.EN);
				expect(body.error).toEqual(errorResponseMessage.BAD_REQUEST.EN);
			});
	});

	it("/inventories/create (POST) with storeID, title, unit, sk_plu -> should be JSON with status true and object with InventoryItem Schema", () => {
		return request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.send({ storeID: 240, title: 'E2E Test title', unit: 'E2E Test unit', sk_plu: 'E2E Test sk_plu' })
			.expect(HttpStatus.CREATED)
			.expect(({ body }) => {
				expect(body.message).toEqual([inventoryResponseMessage.CREATE_INVENTORY.EN]);
				expect(body.data).toHaveProperty('inventoryItemID');
			});
	});

	it("/inventories/create (POST) with storeID, title, unit, without at least a property -> should be JSON with status false and object null", () => {
		return request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.send({ storeID: 240, title: 'E2E Test title', unit: 'E2E Test unit', sk_plu: null })
			.expect(HttpStatus.UNPROCESSABLE_ENTITY);
	});

	it("/inventories/edit (PATCH) with :[id] in query and inventory detail in body -> should be JSON with status true and object Inventory Schema", async () => {
		const postRes = await request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.send({ storeID: 10, title: 'E2E Test title', unit: 'E2E Test unit', sk_plu: 'E2E Test sk_plu' })
			.expect(HttpStatus.CREATED);

		const { data } = postRes.body;
		expect(data).toBeDefined();
		expect(data).toHaveProperty('inventoryItemID');

		return request(app.getHttpServer())
			.patch(`${urlsConstant.ROUTE_PREFIX_INVENTORY}/${data.inventoryItemID}`)
			.set(authHeader)
			.send({ storeID: 241, title: 'E2E Test title edit', unit: 'E2E Test unit edit', sk_plu: 'E2E Test sk_plu edit' })
			.expect(HttpStatus.OK)
			.expect(({ body }) => {
				// expect(body.status).toEqual(true);
				expect(body.message).toEqual([inventoryResponseMessage.UPDATE_INVENTORY.EN]);
				expect(body.data).toHaveProperty('inventoryItemID');
			});
	});

	it("/inventories/delete (DELETE) with :[id] single delete -> should be JSON with status true", async () => {
		const postRes = await request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.send({ storeID: 10, title: 'E2E Test title', unit: 'E2E Test unit', sk_plu: 'E2E Test sk_plu' })
			.expect(HttpStatus.CREATED);

		const { data } = postRes.body;
		expect(data).toBeDefined();
		expect(data).toHaveProperty('inventoryItemID');

		return request(app.getHttpServer())
			.delete(`${urlsConstant.ROUTE_PREFIX_INVENTORY}/${data.inventoryItemID}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(({ body }) => {
				expect(body.message).toEqual([inventoryResponseMessage.DELETE_INVENTORY.EN]);
				expect(body.data).toBeNull();
			});
	});

	it("/inventories/delete (DELETE) with queryparam ids bulk delete -> should be JSON with status true", async () => {
		const postRes1 = await request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.send({ storeID: 10, title: 'E2E Test title', unit: 'E2E Test unit', sk_plu: 'E2E Test sk_plu' })
			.expect(HttpStatus.CREATED);

		const body1 = postRes1.body;
		expect(body1).toBeDefined();

		const data = body1.data;
		expect(data).toHaveProperty('inventoryItemID');

		const postRes2 = await request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.send({ storeID: 10, title: 'E2E Test title', unit: 'E2E Test unit', sk_plu: 'E2E Test sk_plu' })
			.expect(HttpStatus.CREATED);

		const body2 = postRes2.body;
		expect(body2).toBeDefined();

		const data2 = body2.data;
		expect(data2).toHaveProperty('inventoryItemID');

		const postRes3 = await request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_INVENTORY}`)
			.set(authHeader)
			.send({ storeID: 10, title: 'E2E Test title', unit: 'E2E Test unit', sk_plu: 'E2E Test sk_plu' })
			.expect(HttpStatus.CREATED);

		const body3 = postRes3.body;
		expect(body3).toBeDefined();

		const data3 = body3.data;
		expect(data3).toHaveProperty('inventoryItemID');

		return request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_INVENTORY}${urlsConstant.API_DELETE_INVENTORIES}`)
			.set(authHeader)
			.send({ ids: [data["inventoryItemID"], data2["inventoryItemID"], data3["inventoryItemID"]] })
			.expect(HttpStatus.OK)
			.expect(({ body }) => {
				expect(body.message).toEqual([inventoryResponseMessage.DELETE_INVENTORYS.EN]);
				expect(body.data).toBeNull();
			});
	});
});
