import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { SalesRepository } from "../sales.repository";
import { SalesEndOfDayService } from "./sales-end-of-day.service";

describe("SalesEndOfDayService", () => {
	let service: SalesEndOfDayService;
	let repository: SalesRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SalesEndOfDayService,
				{
					provide: SalesRepository,
					useValue: {
						findEndOfDay: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<SalesEndOfDayService>(SalesEndOfDayService);
		repository = module.get<SalesRepository>(SalesRepository);
	});

	it("should return end of day report when transactions are found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 10;
		const endOfDay = [
			{
				transactionDate: "2024-08-15",
				totalTransaction: 1,
				revenue: 1000,
				cashPayment: 1,
				cardPayment: 0,
				tip: 52,
				serviceCharge: 10,
				averageValue: 1000,
				deliveryFee: 0,
				discount: 0,
				quantityRefund: 0,
				totalRefund: 1000,
			},
		];
		const mockEndOfDay = { data: endOfDay, count };

		jest.spyOn(repository, "findEndOfDay").mockResolvedValue(mockEndOfDay);

		const result = await service.getEndOfDay(filterData);

		expect(result).toEqual({
			revenue: endOfDay,
			summary: {
				totalTransaction: 1,
				revenue: 1000,
				cashPayment: 1,
				cardPayment: 0,
				tip: 52,
				serviceCharge: 10,
				averageValue: 1000,
				deliveryFee: 0,
				discount: 0,
				quantityRefund: 0,
				totalRefund: 1000,
			},
			pagination: {
				totalPages: 1,
				currentPage: 1,
			},
		});
	});

	it("should throw NotFoundException when no transactions are found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };

		jest.spyOn(repository, "findEndOfDay").mockResolvedValue({ data: [], count: 0 });

		await expect(service.getEndOfDay(filterData)).rejects.toThrow(
			new NotFoundException(analyticsResponseMessage.ANALYTICS_END_OF_DAY_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN),
		);
	});
});
