import { HttpStatus } from "@nestjs/common";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import { urlsConstant } from "src/common/constants";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { CategoryService } from "../src/category/category.service";
import { AuthUtil } from "./utils/auth.util";

describe("CategoryController (e2e)", () => {
	let app: NestFastifyApplication;
	let categoryService: CategoryService;
	let userId: number;
	let authHeader: any;


	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
		categoryService = moduleFixture.get<CategoryService>(CategoryService);
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

	it(`get category list (GET)`, () => {
		return request(app.getHttpServer())
			.get(`${urlsConstant.ROUTE_PREFIX_CATEGORY}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body.data).toBeInstanceOf(Object);
			});
	});

	it(`add category (POST)`, () => {
		const createCategoryDto = { name: "Test Category" }; // Adjust DTO as per your definition
		return request(app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_CATEGORY}`)
			.set(authHeader)
			.send(createCategoryDto)
			.expect(HttpStatus.CREATED)
			.expect(response => {
				expect(response.body.data).toHaveProperty("id");
				expect(response.body.data.name).toEqual("Test Category");
			});
	});

	it(`update category (PUT)`, async () => {
		const createCategoryDto: any = { name: "Category 1" };
		const category = await categoryService.addCategory(createCategoryDto)
		const editCategoryDto = { name: "Updated Category" };
		const categoryIdDto = { categoryId: category["id"] };
		return request(app.getHttpServer())
			.put(`${urlsConstant.ROUTE_PREFIX_CATEGORY}/${categoryIdDto.categoryId}`)
			.set(authHeader)
			.send(editCategoryDto)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body.message).toEqual(["Category updated successfully"]);
			});
	});

	it(`delete category (DELETE)`, async () => {
		const createCategoryDto: any = { name: "Category 1" };
		const category = await categoryService.addCategory(createCategoryDto)
		const categoryIdDto = { categoryId: category["id"] };
		return request(app.getHttpServer())
			.delete(`${urlsConstant.ROUTE_PREFIX_CATEGORY}/${categoryIdDto.categoryId}`)
			.set(authHeader)
			.expect(HttpStatus.OK)
			.expect(response => {
				expect(response.body).toHaveProperty("message", ["Category deleted successfully"]);
			});
	});
});
