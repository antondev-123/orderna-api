import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { FilterPeriod } from "../common/constants";
import { ProductEntity } from "../product/product.entity";
import { ProductRepository } from "../product/product.repository";
import { StoreRepository } from "../store/repository/store.repository";
import { TransactionItemEntity } from "../transaction/entities/transaction-item.entity";
import { TransactionEntity } from "../transaction/entities/transaction.entity";
import { TransactionRepository } from "../transaction/repositories/transaction.repository";
import { DashboardAnalyticsService } from "./dashboard-analytics.service";
import { CompareStoresDto } from "./dtos/compare-stores.dto";
import { GetBestSellersDto } from "./dtos/get-best-sellers.dto";
import { GetTotalSalesDto } from "./dtos/get-total-sales.dto";
import { GetTotalTransactionsDto } from "./dtos/get-total-transactions.dto";

describe("DashboardAnalyticsService", () => {
	let service: DashboardAnalyticsService;
	let transactionRepository: TransactionRepository;
	let transactionItemRepository: Repository<TransactionItemEntity>;
	let productRepository: ProductRepository;
	let storeRepository: StoreRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DashboardAnalyticsService,
				{
					provide: TransactionRepository,
					useValue: {
						createQueryBuilder: jest.fn().mockReturnValue({
							innerJoin: jest.fn().mockReturnThis(),
							select: jest.fn().mockReturnThis(),
							addSelect: jest.fn().mockReturnThis(),
							where: jest.fn().mockReturnThis(),
							andWhere: jest.fn().mockReturnThis(),
							groupBy: jest.fn().mockReturnThis(),
							addGroupBy: jest.fn().mockReturnThis(),
							orderBy: jest.fn().mockReturnThis(),
							limit: jest.fn().mockReturnThis(),
							getRawMany: jest.fn(),
						}),
					},
				},
				{
					provide: getRepositoryToken(TransactionItemEntity),
					useValue: {
						find: jest.fn(),
					},
				},
				{
					provide: ProductRepository,
					useValue: {
						findOne: jest.fn(),
					},
				},
				{
					provide: StoreRepository,
					useValue: {
						findStoreById: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<DashboardAnalyticsService>(DashboardAnalyticsService);
		transactionRepository = module.get<TransactionRepository>(TransactionRepository);
		transactionItemRepository = module.get<Repository<TransactionItemEntity>>(getRepositoryToken(TransactionItemEntity));
		productRepository = module.get<ProductRepository>(ProductRepository);
		storeRepository = module.get<StoreRepository>(StoreRepository);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("getSalesSummary", () => {
		it("should return data by period with calculated metrics", async () => {
			const filter: GetTotalTransactionsDto = {
				storeId: 1,
				period: FilterPeriod.TODAY,
			};

			const mockTransactions = [
				{ totalValue: 100, totalDiscount: 10, totalCost: 50 },
				{ totalValue: 200, totalDiscount: 20, totalCost: 100 },
			];

			jest
				.spyOn(transactionRepository.createQueryBuilder(), "getRawMany")
				.mockResolvedValueOnce(mockTransactions)
				.mockResolvedValueOnce(mockTransactions);

			const result = await service.getSalesSummary(filter);

			expect(result).toEqual({
				totalTransactions: {
					current: 2,
					last: 2,
					change: 0,
				},
				totalDiscount: {
					current: 30,
					last: 30,
					change: 0,
				},
				averageOrderValue: {
					current: 150,
					last: 150,
					change: 0,
				},
				costOfGoods: {
					current: 150,
					last: 150,
					change: 0,
				},
				revenue: {
					current: 300,
					last: 300,
					change: 0,
				},
				grossProfit: {
					current: 150,
					last: 150,
					change: 0,
				},
			});

			expect(transactionRepository.createQueryBuilder().select).toHaveBeenCalledWith([
				"transaction.totalValue as totalValue",
				"transaction.totalDiscount as totalDiscount",
				"transaction.totalCost as totalCost",
			]);
			expect(transactionRepository.createQueryBuilder().where).toHaveBeenCalledWith("transaction.store = :storeId", { storeId: filter.storeId });
			expect(transactionRepository.createQueryBuilder().getRawMany).toHaveBeenCalledTimes(2);
		});

		it("should handle errors and throw", async () => {
			const filter: GetTotalTransactionsDto = {
				storeId: 1,
				period: FilterPeriod.TODAY,
			};

			jest.spyOn(transactionRepository.createQueryBuilder(), "getRawMany").mockRejectedValueOnce(new Error("Database error"));

			await expect(service.getSalesSummary(filter)).rejects.toThrow("Database error");
		});

		it("should correctly calculate metrics", () => {
			const mockTransactions = [
				{ totalValue: 100, totalDiscount: 10, totalCost: 50 },
				{ totalValue: 200, totalDiscount: 20, totalCost: 100 },
			];

			const result = service["calculateMetrics"](mockTransactions as any);

			expect(result).toEqual({
				totalTransactions: 2,
				totalRevenue: 300,
				avgOrderValue: 150,
				totalDiscounts: 30,
				costOfGoods: 150,
				grossProfit: 150,
			});
		});
	});

	describe("getTotalSales", () => {
		it("should return total sales based on filter", () => {
			const mockResult = [
				{ totalSales: 100, transactionDate: "2021-09-01" },
				{ totalSales: 200, transactionDate: "2021-09-02" },
			];
			const filter: GetTotalSalesDto = { storeId: 1, period: FilterPeriod.LAST_7_DAYS };
			const queryBuilder = transactionRepository.createQueryBuilder("transaction") as jest.Mocked<SelectQueryBuilder<TransactionEntity>>;

			queryBuilder.getRawMany.mockResolvedValue(mockResult);

			const result = service.getTotalSales(filter);

			expect(queryBuilder.select).toHaveBeenCalledWith("SUM(transaction.totalValue)", "totalSales");
			expect(queryBuilder.addSelect).toHaveBeenCalledWith("DATE(transaction.createdAt)", "transactionDate");
			expect(queryBuilder.andWhere).toHaveBeenCalledWith("transaction.store.id = :storeId", { storeId: filter.storeId });
			expect(queryBuilder.groupBy).toHaveBeenCalledWith("DATE(transaction.createdAt)");
			expect(result).resolves.toBe(mockResult);
		});

		it("should throw an error if something goes wrong", () => {
			const filter: GetTotalSalesDto = { storeId: 1, period: FilterPeriod.LAST_7_DAYS };
			const queryBuilder = transactionRepository.createQueryBuilder("transaction") as jest.Mocked<SelectQueryBuilder<TransactionEntity>>;

			queryBuilder.getRawMany.mockRejectedValue(new Error());

			expect(service.getTotalSales(filter)).rejects.toThrowError();
		});
	});

	describe("getCompareStores", () => {
		it("should return comparison results for stores", async () => {
			const filter: CompareStoresDto = {
				baseStoreId: 1,
				storeId: [1],
				period: FilterPeriod.TODAY,
			};

			const mockStore = { id: 1, Name: "Store 1" };
			const mockTransactionItems = [{ product: { id: 1 }, totalValue: 100, quantity: 2 }];
			const mockProduct = { id: 1, cost: 50 };

			jest.spyOn(storeRepository, "findStoreById").mockResolvedValueOnce(mockStore as any);
			jest.spyOn(transactionRepository.createQueryBuilder(), "getRawMany").mockResolvedValueOnce([{ transaction_id: 1 }]);
			jest.spyOn(transactionItemRepository, "find").mockResolvedValueOnce(mockTransactionItems as any);
			jest.spyOn(productRepository, "findOne").mockResolvedValueOnce(mockProduct as any);

			jest.spyOn(storeRepository, "findStoreById").mockResolvedValueOnce(mockStore as any);
			jest.spyOn(transactionRepository.createQueryBuilder(), "getRawMany").mockResolvedValue([{ transaction_id: 2 }]);
			jest.spyOn(transactionItemRepository, "find").mockResolvedValue(mockTransactionItems as any);
			jest.spyOn(productRepository, "findOne").mockResolvedValue(mockProduct as any);

			const result = await service.getCompareStores(filter);

			expect(result).toEqual([
				{ storeName: "Store 1", gross: 200, cost: 100, expense: 10, net: 90 },
				{ storeName: "Store 1", gross: 200, cost: 100, expense: 10, net: 90 },
			]);
		});

		it("should throw NotFoundException if base store is not found", async () => {
			const filter: CompareStoresDto = {
				baseStoreId: 1,
				storeId: [1],
				period: FilterPeriod.TODAY,
			};

			jest.spyOn(storeRepository, "findStoreById").mockResolvedValueOnce(null);

			await expect(service.getCompareStores(filter)).rejects.toThrow(NotFoundException);
		});

		it("should throw NotFoundException if base store is not found", async () => {
			const filter: CompareStoresDto = {
				baseStoreId: 1,
				storeId: [2, 3],
				period: FilterPeriod.TODAY,
			};

			jest.spyOn(storeRepository, "findStoreById").mockResolvedValueOnce(null);
			jest.spyOn(transactionRepository.createQueryBuilder(), "getRawMany").mockResolvedValueOnce([]);

			await expect(service.getCompareStores(filter)).rejects.toThrow(NotFoundException);
		});

		it("should handle error during calculation", async () => {
			const filter: CompareStoresDto = {
				baseStoreId: 1,
				storeId: [2, 3],
				period: FilterPeriod.TODAY,
			};

			const mockStore = { id: 1, Name: "Store 1" };

			jest.spyOn(storeRepository, "findStoreById").mockResolvedValueOnce(mockStore as any);
			jest.spyOn(transactionRepository.createQueryBuilder(), "getRawMany").mockRejectedValueOnce(new Error("Calculation error"));

			await expect(service.getCompareStores(filter)).rejects.toThrow("Calculation error");
		});

		it("should calculate cost of goods sold", async () => {
			const mockTransactionItems = [{ product: { id: 1 }, totalValue: 100, quantity: 2 }];
			const mockProduct = { id: 1, cost: 50 };

			jest.spyOn(productRepository, "findOne").mockResolvedValue(mockProduct as any);

			const result = await service["calculateCostOfGoodsSold"](mockTransactionItems);

			expect(result).toBe(100);
		});

		it("should calculate expenses", async () => {
			const filter: CompareStoresDto = {
				baseStoreId: 1,
				storeId: [2, 3],
				period: FilterPeriod.TODAY,
			};

			jest.spyOn(transactionRepository.createQueryBuilder(), "getRawMany").mockResolvedValue([{ transaction_id: 1 }]);

			const result = await service["calculateExpenses"](filter);

			expect(result).toBe(10);
		});
	});

	describe("getBestSellers", () => {
		it("should return the best sellers based on the filter", async () => {
			const mockResult = [
				{ productName: "Product 1", unitSold: 10, revenue: 100 },
				{ productName: "Product 2", unitSold: 5, revenue: 50 },
			];
			const filter: GetBestSellersDto = { storeId: 1, period: FilterPeriod.LAST_7_DAYS };
			const queryBuilder = transactionRepository.createQueryBuilder("transaction") as jest.Mocked<SelectQueryBuilder<TransactionEntity>>;

			queryBuilder.getRawMany.mockResolvedValue(mockResult);

			const result = await service.getBestSellers(filter);

			expect(queryBuilder.innerJoin).toHaveBeenCalledWith(TransactionItemEntity, "items");
			expect(queryBuilder.innerJoin).toHaveBeenCalledWith(ProductEntity, "product", "items.product = product.id");
			expect(queryBuilder.select).toHaveBeenCalledWith("product.title", "productName");
			expect(queryBuilder.addSelect).toHaveBeenCalledWith("SUM(items.remainingQuantity)", "unitSold");
			expect(queryBuilder.addSelect).toHaveBeenCalledWith("SUM(transaction.totalValue)", "revenue");
			expect(queryBuilder.where).toHaveBeenCalledWith("transaction.store.id = :storeId", { storeId: filter.storeId });
			expect(queryBuilder.groupBy).toHaveBeenCalledWith("items.product");
			expect(queryBuilder.limit).toHaveBeenCalledWith(10);
			expect(queryBuilder.getRawMany).toHaveBeenCalled();

			expect(result).toEqual(mockResult);
		});

		it("should throw an error if something goes wrong", async () => {
			const filter: GetBestSellersDto = { storeId: 1, period: FilterPeriod.TODAY };
			const queryBuilder = transactionRepository.createQueryBuilder("transaction") as jest.Mocked<SelectQueryBuilder<TransactionEntity>>;

			queryBuilder.getRawMany.mockRejectedValue(new Error("Something went wrong"));

			await expect(service.getBestSellers(filter)).rejects.toThrow("Something went wrong");
		});
	});
});
