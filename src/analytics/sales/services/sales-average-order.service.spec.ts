import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { SalesRepository } from "../sales.repository";
import { SalesAverageOrderService } from "./sales-average-order.service";

describe("SalesAverageOrderService", () => {
	let service: SalesAverageOrderService;
	let repository: SalesRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SalesAverageOrderService,
				{
					provide: SalesRepository,
					useValue: {
						findAverageOrder: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<SalesAverageOrderService>(SalesAverageOrderService);
		repository = module.get<SalesRepository>(SalesRepository);
	});

	it("should return average order when transactions are found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 10;
		const averageOrder = [
			{
				transactionDate: "2024-08-15",
				revenue: 1000,
				totalTransaction: 1,
				averageValue: 1000,
			},
		];
		const mockAverageOrder = { data: averageOrder, count };

		jest.spyOn(repository, "findAverageOrder").mockResolvedValue(mockAverageOrder);

		const result = await service.getAverageOrder(filterData);

		expect(result).toEqual({
			averageOrder: averageOrder,
			pagination: {
				totalPages: 1,
				currentPage: 1,
			},
		});
	});

	it("should throw an error when transactions are not found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 0;
		const averageOrder = [];
		const mockAverageOrder = { data: averageOrder, count };

		jest.spyOn(repository, "findAverageOrder").mockResolvedValue(mockAverageOrder);

		await expect(service.getAverageOrder(filterData)).rejects.toThrow(
			new NotFoundException(analyticsResponseMessage.ANALYTICS_AVERAGE_ORDER_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN),
		);
	});
});
