import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { SalesRepository } from "../sales.repository";
import { SalesDayOfWeekService } from "./sales-day-of-week.service";

describe("SalesDayOfWeekService", () => {
	let service: SalesDayOfWeekService;
	let repository: SalesRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SalesDayOfWeekService,
				{
					provide: SalesRepository,
					useValue: {
						findDayOfWeek: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<SalesDayOfWeekService>(SalesDayOfWeekService);
		repository = module.get<SalesRepository>(SalesRepository);
	});

	it("should return sales by day of week when transactions are found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 10;
		const salesByDayOfWeek = [{ id: 1 }, { id: 2 }];
		const mockSalesByDayOfWeek = { data: salesByDayOfWeek, count };
		repository.findDayOfWeek = jest.fn().mockResolvedValue(mockSalesByDayOfWeek);

		const result = await service.getSalesByDayOfWeek(filterData);

		expect(result).toEqual({
			dayOfWeek: salesByDayOfWeek,
			pagination: {
				totalPages: 1,
				currentPage: 1,
			},
		});
	});

	it("should throw an error when transactions are not found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 0;
		const salesByDayOfWeek = [];
		const mockSalesByDayOfWeek = { data: salesByDayOfWeek, count };
		repository.findDayOfWeek = jest.fn().mockResolvedValue(mockSalesByDayOfWeek);

		await expect(service.getSalesByDayOfWeek(filterData)).rejects.toThrow(
			new NotFoundException(analyticsResponseMessage.ANALYTICS_DAY_OF_WEEK_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN),
		);
	});
});
