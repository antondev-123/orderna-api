import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { errorResponseMessage } from "../../../common/constants";
import { SalesRefundService } from "./sales-refund.service";
import { SalesRepository } from "../sales.repository";
import { RefundFilterDto } from "../dtos/refund-filter.dto";

describe("RefundService", () => {
	let service: SalesRefundService;
	let repository: SalesRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SalesRefundService,
				{
					provide: SalesRepository,
					useValue: {
						findTransactionRefunds: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<SalesRefundService>(SalesRefundService);
		repository = module.get<SalesRepository>(SalesRepository);
	});

	it("should return refunds and pagination when transactions are found", async () => {
		const filterData: RefundFilterDto = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 10;
		const refunds = [{ id: 1 }, { id: 2 }];
		const mockRefunds = { data: refunds, count };

		jest.spyOn(repository, "findTransactionRefunds").mockResolvedValue(mockRefunds);

		const result = await service.findRefundTransactionAll(filterData);

		expect(result).toEqual({
			refunds: refunds,
			pagination: {
				totalPages: 1,
				currentPage: 1,
			},
		});
	});

	it("should throw NotFoundException when no transactions are found", async () => {
		const filterData: RefundFilterDto = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };

		jest.spyOn(repository, "findTransactionRefunds").mockResolvedValue({ data: [], count: 0 });

		await expect(service.findRefundTransactionAll(filterData)).rejects.toThrow(
			new NotFoundException(analyticsResponseMessage.ANALYTICS_REFUND_TRANSACTION_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN),
		);
	});

	it("should handle pagination correctly", async () => {
		const filterData: RefundFilterDto = { page: 2, limit: 5, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const count = 12;
		const refunds = [{ id: 1 }, { id: 2 }];
		const mockRefunds = { data: refunds, count };

		jest.spyOn(repository, "findTransactionRefunds").mockResolvedValue(mockRefunds);

		const result = await service.findRefundTransactionAll(filterData);

		expect(result).toEqual({
			refunds: refunds,
			pagination: {
				totalPages: 3,
				currentPage: 2,
			},
		});
	});
});
