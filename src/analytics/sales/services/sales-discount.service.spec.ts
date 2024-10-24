import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { TransactionRepository } from "../../../transaction/repositories/transaction.repository";
import { SalesRepository } from "../sales.repository";
import { SalesDiscountService } from "./sales-discount.service";

describe("SalesDiscountService", () => {
	let service: SalesDiscountService;
	let discountRepository: SalesRepository;
	let transactionRepository: TransactionRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SalesDiscountService,
				{
					provide: SalesRepository,
					useValue: {
						findDiscountStore: jest.fn(),
						findDiscountTransaction: jest.fn(),
					},
				},
				{
					provide: TransactionRepository,
					useValue: {
						findCountTransaction: jest.fn(),
						findDiscountTransaction: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<SalesDiscountService>(SalesDiscountService);
		discountRepository = module.get<SalesRepository>(SalesRepository);
		transactionRepository = module.get(getRepositoryToken(TransactionRepository));
	});

	describe("getDiscountsSummary", () => {
		it(`should return ${analyticsResponseMessage.ANALYTICS_DISCOUNT_SUMMARY.EN}`, async () => {
			const params = {
				storeId: 1,
				fromDate: new Date(),
				toDate: new Date(),
				page: 1,
				limit: 10,
			};

			const mockDiscountStores = {
				total: 1,
				data: [
					{
						discountStoreId: 1,
						storeId: 1,
						storeName: "store 1",
						discount: {
							discountId: 1,
							discountCode: "code 1",
						},
					},
				],
			};

			const mockTransactions = [
				{
					discountTransaction_amount: 100,
					transaction_totalValue: 200,
				},
			];

			jest.spyOn(discountRepository, "findDiscountStore").mockResolvedValue(mockDiscountStores as any);
			jest.spyOn(discountRepository, "findDiscountTransaction").mockResolvedValue(mockTransactions);

			const result = await service.getDiscountsSummary(params);

			expect(result).toEqual({
				summary: [
					{
						storeId: 1,
						storeName: "store 1",
						discountStoreId: 1,
						discountCode: "code 1",
						usageCount: 1,
						totalRedeemed: 100,
						averageTransactionValue: 200,
					},
				],
				pagination: {
					totalPages: 1,
					currentPage: 1,
				},
			});
		});

		it("should throw NotFoundException if no discount found in store", async () => {
			const params = {
				storeId: 1,
				fromDate: new Date(),
				toDate: new Date(),
				page: 1,
				limit: 10,
			};

			jest.spyOn(discountRepository, "findDiscountStore").mockResolvedValue({ total: 0, data: [] });

			await expect(service.getDiscountsSummary(params)).rejects.toThrowError("No discount found");
		});
	});

	describe("getDiscountTransaction", () => {
		it("should return count of transaction", async () => {
			const params = {
				storeId: 1,
				fromDate: new Date(),
				toDate: new Date(),
				page: 1,
				limit: 100,
			};

			const mockCount = 1;
			const mockTransactions = {
				transactionId: 5,
				transactionDate: "2024-07-01",
				discountCode: "CODE123",
				discountType: "Total Discount",
				customerName: "John Doe",
				transactionNumber: "",
				transactionTotal: 1000,
				discountAmount: 50,
			};

			jest.spyOn(transactionRepository, "findCountTransaction").mockResolvedValue(mockCount);
			jest.spyOn(transactionRepository, "findDiscountTransaction").mockResolvedValue(mockTransactions as any);

			const result = await service.getDiscountTransaction(params);

			expect(result).toEqual({
				transaction: mockTransactions,
				pagination: {
					totalPages: 1,
					currentPage: 1,
				},
			});
		});

		it("should not found discount transaction", async () => {
			const params = {
				storeId: 1,
				fromDate: new Date(),
				toDate: new Date(),
				page: 1,
				limit: 100,
			};

			jest.spyOn(transactionRepository, "findCountTransaction").mockResolvedValue(0);
			await expect(service.getDiscountTransaction(params)).rejects.toThrowError("No transaction found");
		});
	});
});
