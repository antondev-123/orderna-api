import { SalesFailedService } from "./sales-failed.service";
import { SalesRepository } from "../sales.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { errorResponseMessage } from "../../../common/constants";

describe("FailedService", () => {
	let service: SalesFailedService;
	let repository: SalesRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SalesFailedService,
				{
					provide: SalesRepository,
					useValue: {
						findAllFailedTransaction: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<SalesFailedService>(SalesFailedService);
		repository = module.get<SalesRepository>(SalesRepository);
	});

	it("should return failed transactions and pagination when transactions are found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 10;
		const failed = [{ id: 1 }, { id: 2 }];
		const mockFailed = { data: failed, count };

		jest.spyOn(repository, "findAllFailedTransaction").mockResolvedValue(mockFailed);

		const result = await service.findFailedTransactionAll(filterData);

		expect(result).toEqual({
			failed: failed,
			pagination: {
				totalPages: 1,
				currentPage: 1,
			},
		});
	});

	it("should throw NotFoundException when no transactions are found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };

		jest.spyOn(repository, "findAllFailedTransaction").mockResolvedValue({ data: [], count: 0 });

		await expect(service.findFailedTransactionAll(filterData)).rejects.toThrow(
			new NotFoundException(analyticsResponseMessage.ANALYTICS_FAILED_TRANSACTION_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN),
		);
	});

	it("should handle pagination correctly", async () => {
		const filterData = { page: 2, limit: 5, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 10;
		const failed = [{ id: 1 }, { id: 2 }];
		const mockFailed = { data: failed, count };

		jest.spyOn(repository, "findAllFailedTransaction").mockResolvedValue(mockFailed);

		const result = await service.findFailedTransactionAll(filterData);

		expect(result).toEqual({
			failed: failed,
			pagination: {
				totalPages: 2,
				currentPage: 2,
			},
		});
	});
});
