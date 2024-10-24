import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository, SelectQueryBuilder } from "typeorm";
import { FilterPeriod } from "../common/constants";
import { applyFilterByStaticCurrentPeriod, applyFilterByStaticLastPeriod } from "../common/utils/filter.util";
import { ProductEntity } from "../product/product.entity";
import { ProductRepository } from "../product/product.repository";
import { StoreRepository } from "../store/repository/store.repository";
import { TransactionItemEntity } from "../transaction/entities/transaction-item.entity";
import { TransactionEntity } from "../transaction/entities/transaction.entity";
import { TransactionRepository } from "../transaction/repositories/transaction.repository";
import { CompareStoresDto } from "./dtos/compare-stores.dto";
import { GetBestSellersDto } from "./dtos/get-best-sellers.dto";
import { GetTotalSalesDto } from "./dtos/get-total-sales.dto";
import { GetTotalTransactionsDto } from "./dtos/get-total-transactions.dto";

@Injectable()
export class DashboardAnalyticsService {
	constructor(
		private readonly transactionRepository: TransactionRepository,
		@InjectRepository(TransactionItemEntity)
		private transactionItemRepository: Repository<TransactionItemEntity>,
		@InjectRepository(ProductRepository)
		private productRepository: ProductRepository,
		@InjectRepository(StoreRepository)
		private storeRepository: StoreRepository,
	) { }

	private applyStaticPeriodFilter(tableAlias: string, query: SelectQueryBuilder<TransactionEntity>, period: FilterPeriod) {
		if (period) {
			applyFilterByStaticCurrentPeriod(query, period, tableAlias);
		}
	}

	private applyStaticPeriodFilterLastPeriod(tableAlias: string, query: SelectQueryBuilder<TransactionEntity>, period: FilterPeriod) {
		if (period) {
			applyFilterByStaticLastPeriod(query, period, tableAlias);
		}
	}

	private async getComparisonData(filter: GetTotalTransactionsDto): Promise<TransactionEntity[]> {
		const query = this.transactionRepository
			.createQueryBuilder("transaction")
			.select(["transaction.totalValue as totalValue", "transaction.totalDiscount as totalDiscount", "transaction.totalCost as totalCost"])
			.where("transaction.store = :storeId", { storeId: filter.storeId });

		this.applyStaticPeriodFilterLastPeriod("transaction", query, filter.period);

		return await query.getRawMany();
	}

	private calculateMetrics(transactions: TransactionEntity[]): any {
		const totalTransactions = transactions.length;
		const totalRevenue = transactions.reduce((acc, t) => acc + t.totalValue, 0);
		const avgOrderValue = totalTransactions ? totalRevenue / totalTransactions : 0;
		const totalDiscounts = transactions.reduce((acc, t) => acc + t.totalDiscount, 0);
		const costOfGoods = transactions.reduce((acc, t) => acc + t.totalCost, 0);
		const grossProfit = totalRevenue - costOfGoods;

		return {
			totalTransactions,
			totalRevenue,
			avgOrderValue,
			totalDiscounts,
			costOfGoods,
			grossProfit,
		};
	}

	async getSalesSummary(filter: GetTotalTransactionsDto): Promise<any> {
		try {
			const query = this.transactionRepository
				.createQueryBuilder("transaction")
				.select(["transaction.totalValue as totalValue", "transaction.totalDiscount as totalDiscount", "transaction.totalCost as totalCost"])
				.where("transaction.store = :storeId", { storeId: filter.storeId });

			this.applyStaticPeriodFilter("transaction", query, filter.period);
			let comparisonPeriod = null;
			const comparisonPeriodData = await this.getComparisonData(filter);
			const currentPeriod = this.calculateMetrics(await query.getRawMany());

			if (filter.period === FilterPeriod.MAX) {
				comparisonPeriod = 0;
			} else {
				comparisonPeriod = this.calculateMetrics(comparisonPeriodData);
			}

			return {
				totalTransactions: {
					current: currentPeriod.totalTransactions || 0,
					last: comparisonPeriod.totalTransactions || 0,
					change:
						Math.round(((currentPeriod.totalTransactions - comparisonPeriod.totalTransactions) / comparisonPeriod.totalTransactions) * 100) || 0,
				},
				totalDiscount: {
					current: currentPeriod.totalDiscounts || 0,
					last: comparisonPeriod.totalDiscounts || 0,
					change: Math.round(((currentPeriod.totalDiscounts - comparisonPeriod.totalDiscounts) / comparisonPeriod.totalDiscounts) * 100) || 0,
				},
				averageOrderValue: {
					current: currentPeriod.avgOrderValue || 0,
					last: comparisonPeriod.avgOrderValue || 0,
					change: Math.round(((currentPeriod.avgOrderValue - comparisonPeriod.avgOrderValue) / comparisonPeriod.avgOrderValue) * 100) || 0,
				},
				costOfGoods: {
					current: currentPeriod.costOfGoods || 0,
					last: comparisonPeriod.costOfGoods || 0,
					change: Math.round(((currentPeriod.costOfGoods - comparisonPeriod.costOfGoods) / comparisonPeriod.costOfGoods) * 100) || 0,
				},
				revenue: {
					current: currentPeriod.totalRevenue || 0,
					last: comparisonPeriod.totalRevenue || 0,
					change: Math.round(((currentPeriod.totalRevenue - comparisonPeriod.totalRevenue) / comparisonPeriod.totalRevenue) * 100) || 0,
				},
				grossProfit: {
					current: currentPeriod.grossProfit || 0,
					last: comparisonPeriod.grossProfit || 0,
					change: Math.round(((currentPeriod.grossProfit - comparisonPeriod.grossProfit) / comparisonPeriod.grossProfit) * 100) || 0,
				},
			};
		} catch (error) {
			throw error;
		}
	}

	async getTotalSales(filter: GetTotalSalesDto): Promise<any> {
		try {
			const query = this.transactionRepository
				.createQueryBuilder("transaction")
				.select("SUM(transaction.totalValue)", "totalSales")
				.addSelect("DATE(transaction.createdAt)", "transactionDate")
				.andWhere("transaction.store.id = :storeId", { storeId: filter.storeId })
				.groupBy("DATE(transaction.createdAt)");

			this.applyStaticPeriodFilter("transaction", query, filter.period);

			return await query.getRawMany();
		} catch (error) {
			throw error;
		}
	}

	private async calculateCostOfGoodsSold(transactionItems: any[]): Promise<number> {
		let totalCost = 0;

		for (const item of transactionItems) {
			const product = await this.productRepository.findOne({
				where: { id: item.product.id },
			});
			if (product) {
				totalCost += product.cost * item.quantity;
			}
		}

		return totalCost;
	}

	private async calculateExpenses(filter: CompareStoresDto): Promise<number> {
		const fixedExpensePerTransaction = 10;

		const query = this.transactionRepository
			.createQueryBuilder("transaction")
			.andWhere("transaction.store.id = :storeId", { storeId: filter.storeId });

		this.applyStaticPeriodFilter("transaction", query, filter.period);

		const transactions = await query.getRawMany();

		if (!transactions || transactions.length === 0) {
			return 0;
		}

		return transactions.length * fixedExpensePerTransaction;
	}

	async getCompareStores(filter: CompareStoresDto): Promise<any> {
		try {
			const results = [];

			const storeBase = await this.storeRepository.findStoreById(filter.baseStoreId);

			if (!storeBase) {
				throw new NotFoundException(`Store with id ${filter.baseStoreId} not found`);
			}

			const queryBaseStore = this.transactionRepository
				.createQueryBuilder("transaction")
				.andWhere("transaction.store.id = :storeId", { storeId: filter.baseStoreId });

			this.applyStaticPeriodFilter("transaction", queryBaseStore, filter.period);

			const transactionsBaseStore = await queryBaseStore.getRawMany();

			const transactionIdsBaseStore = transactionsBaseStore.map(transaction => transaction.transaction_id);
			const transactionItemsBaseStore = await this.transactionItemRepository.find({
				relations: ["product"],
				where: {
					transaction: In(transactionIdsBaseStore),
				},
			});

			const grossBaseStore = transactionItemsBaseStore.reduce((sum, item) => {
				return sum + item.totalValue * item.quantity;
			}, 0);

			const costBaseStore = await this.calculateCostOfGoodsSold(transactionItemsBaseStore);
			const expenseBaseStore = await this.calculateExpenses(filter);
			const netBaseStore = grossBaseStore - costBaseStore - expenseBaseStore;

			results.push({ storeName: storeBase.Name, gross: grossBaseStore, cost: costBaseStore, expense: expenseBaseStore, net: netBaseStore });

			for (const storeId of filter.storeId) {
				const store = await this.storeRepository.findStoreById(storeId);
				if (!store) {
					throw new NotFoundException(`Store with id ${storeId} not found`);
				}
				const query = this.transactionRepository.createQueryBuilder("transaction").andWhere("transaction.store.id = :storeId", { storeId: storeId });

				this.applyStaticPeriodFilter("transaction", query, filter.period);

				const transactions = await query.getRawMany();

				const transactionIds = transactions.map(transaction => transaction.transaction_id);
				const transactionItems = await this.transactionItemRepository.find({
					relations: ["product"],
					where: {
						transaction: In(transactionIds),
					},
				});

				const gross = transactionItems.reduce((sum, item) => {
					return sum + item.totalValue * item.quantity;
				}, 0);

				const cost = await this.calculateCostOfGoodsSold(transactionItems);
				const expense = await this.calculateExpenses(filter);
				const net = gross - cost - expense;

				results.push({ storeName: store?.Name, gross, cost, expense, net });
			}
			return results;
		} catch (error) {
			throw error;
		}
	}

	async getBestSellers(filter: GetBestSellersDto): Promise<any> {
		try {
			const query = this.transactionRepository
				.createQueryBuilder("transaction")
				.innerJoin(TransactionItemEntity, "items")
				.innerJoin(ProductEntity, "product", "items.product = product.id")
				.select("product.title", "productName")
				.addSelect("SUM(items.remainingQuantity)", "unitSold")
				.addSelect("SUM(transaction.totalValue)", "revenue")
				.where("transaction.store.id = :storeId", { storeId: filter.storeId })
				.groupBy("items.product")
				.addGroupBy("product.title")
				.limit(10);

			if (filter.sortBy === "revenue") {
				query.orderBy("revenue", filter.sortOrder);
			}

			if (filter.sortBy === "unitSold") {
				query.orderBy("unitSold", filter.sortOrder);
			}

			this.applyStaticPeriodFilter("transaction", query, filter.period);

			return await query.getRawMany();
		} catch (error) {
			throw error;
		}
	}
}
