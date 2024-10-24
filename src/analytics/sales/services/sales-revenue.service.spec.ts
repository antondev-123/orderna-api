import { SalesRepository } from "../sales.repository";
import { SalesRevenueService } from "./sales-revenue.service";
import { Test, TestingModule } from "@nestjs/testing";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { NotFoundException } from "@nestjs/common";
import { errorResponseMessage } from "../../../common/constants";

describe("RevenueService", () => {
	let service: SalesRevenueService;
	let repository: SalesRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SalesRevenueService,
				{
					provide: SalesRepository,
					useValue: {
						findRevenue: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<SalesRevenueService>(SalesRevenueService);
		repository = module.get<SalesRepository>(SalesRepository);
	});

	it("should return revenue, summary and pagination when transactions are found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 10;
		const revenue = { data: [{ transactionCount: 1, revenue: 100, discounts: 10 }], count };

		jest.spyOn(repository, "findRevenue").mockResolvedValue(revenue);

		const result = await service.getRevenue(filterData);

		expect(result).toEqual({
			revenue: revenue.data,
			summary: {
				totalOrders: 1,
				totalSales: 100,
				totalDiscount: 10,
			},
			pagination: {
				totalPages: 1,
				currentPage: 1,
			},
		});
	});

	it("should throw NotFoundException when no transactions are found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };

		jest.spyOn(repository, "findRevenue").mockResolvedValue({ data: [], count: 0 });

		await expect(service.getRevenue(filterData)).rejects.toThrow(
			new NotFoundException(analyticsResponseMessage.ANALYTICS_REVENUE_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN),
		);
	});
});
