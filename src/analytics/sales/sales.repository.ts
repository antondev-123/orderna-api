import { Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { CategoryEntity } from "src/category/category.entity";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { ProductEntity } from "src/product/product.entity";
import { RefundEntity } from "src/refund/entities/refund.entity";
import { TransactionItemEntity } from "src/transaction/entities/transaction-item.entity";
import { TransactionRepository } from "src/transaction/repositories/transaction.repository";
import { EntityManager, Repository, SelectQueryBuilder } from "typeorm";
import { TransactionStatus } from "../../common/constants";
import { DiscountStoreEntity } from "../../discount/entities/discount-stores.entity";
import { DiscountTransactionEntity } from "../../discount/entities/discount-transactions.entity";
import { TransactionEntity } from "../../transaction/entities/transaction.entity";

@Injectable()
export class SalesRepository {
	constructor(
		private readonly transactionRepository: TransactionRepository,
		@InjectRepository(DiscountStoreEntity)
		private readonly discountStoreRepository: Repository<DiscountStoreEntity>,
		@InjectRepository(DiscountTransactionEntity)
		private readonly discountTransactionRepository: Repository<DiscountTransactionEntity>,
		@InjectEntityManager() private readonly entityManager: EntityManager,
	) { }

	async getTimeOfDay(storeId: number, fromDate: Date, toDate: Date, offset: number, limit: number) {
		try {
			const query = this.transactionRepository.createQueryBuilder("transaction");

			this.applyDateFilter("transaction", query, fromDate, toDate);

			query.select("strftime('%H', transaction.createdAt)", 'hour')
				.addSelect('COUNT(transaction.id)', 'orders')
				.addSelect('SUM(transaction.totalValue)', 'grossSales')
				.andWhere("transaction.store = :storeId", { storeId: storeId })
				.groupBy('hour')
				.orderBy('hour', 'ASC');

			const data = await query.getRawMany();

			const hours = Array.from({ length: 24 }, (_, i) => i);

			const TimeOfDay = hours.map(hour => {
				const hourData = data.find(d => parseInt(d.hour) === hour);
				const formattedHour = `${(hour === 0 || hour === 12) ? 12 : (hour % 12).toString().padStart(2, '0')}:00 ${hour < 12 ? 'AM' : 'PM'}`;
				return {
					time_of_day: formattedHour,
					orders: hourData ? hourData.orders : 0,
					gross_sales: hourData ? hourData.grossSales : 0
				};
			});

			const paginatedTimeOfDay = TimeOfDay.slice(offset, offset + limit);


			return paginatedTimeOfDay;

		} catch (error) {
			throw error;
		}
	}

	async getTipsByDay(storeId: number, fromDate: Date, toDate: Date, offset: number, limit: number) {
		const subQuery = this.transactionRepository
			.createQueryBuilder("transaction")
			.select([
				"DATE(transaction.createdAt) as date",
				"SUM(transaction.tip) as tipsRevenue",
			]);

		subQuery.where("transaction.store = :storeId", { storeId: storeId });
		this.applyDateFilter("transaction", subQuery, fromDate, toDate);
		subQuery.orderBy("date", "DESC");
		subQuery.groupBy("date")

		const paginatedQuery = this.entityManager
			.createQueryBuilder()
			.select("subQuery.*")
			.from(`(${subQuery.getQuery()})`, "subQuery")
			.setParameters(subQuery.getParameters())
			.take(limit)
			.skip(offset);

		const result = await paginatedQuery.getRawMany();

		return {
			count: await subQuery.getCount(),
			data: result,
		};
	}

	async getProducts(storeId: number, fromDate: Date, toDate: Date) {
		try {
			const subQuery = this.transactionRepository
				.createQueryBuilder("transaction")
				.innerJoin(TransactionItemEntity, "transactionItem", "transaction.id = transactionItem.transaction")
				.innerJoin(ProductEntity, "product", "transactionItem.product = product.id")
				.select([
					"transaction.id",
					"transaction.createdAt",
					"transactionItem.*",
					"product.title"
				]);

			subQuery.where("transaction.store = :storeId", { storeId: storeId });
			this.applyDateFilter("transaction", subQuery, fromDate, toDate);
			subQuery.orderBy("transaction.createdAt", "DESC");

			const result = await subQuery.getRawMany();

			return {
				count: result.length,
				data: result,
			};
		} catch (error) {
			throw error;
		}
	}

	async getCategories(storeId: number, fromDate: Date, toDate: Date) {
		try {
			const subQuery = this.transactionRepository
				.createQueryBuilder("transaction")
				.innerJoin(TransactionItemEntity, "transactionItem", "transaction.id = transactionItem.transaction")
				.innerJoin(ProductEntity, "product", "transactionItem.product = product.id")
				.innerJoin(CategoryEntity, "category", "product.category = category.id")
				.select([
					"transaction.id",
					"transaction.createdAt",
					"transactionItem.*",
					"category.name"
				]);

			subQuery.where("transaction.store = :storeId", { storeId: storeId });
			this.applyDateFilter("transaction", subQuery, fromDate, toDate);
			subQuery.orderBy("transaction.createdAt", "DESC");

			const result = await subQuery.getRawMany();

			return {
				count: result.length,
				data: result,
			};
		} catch (error) {
			throw error;
		}
	}


	async findDiscountStore({ storeId, limit, page }) {
		try {
			const offset = (page - 1) * limit;

			const countDiscountStore = await this.discountStoreRepository.count({
				where: {
					storeId,
				},
			});

			const findAllDiscountStore = await this.discountStoreRepository.find({
				where: {
					storeId,
				},
				select: {
					storeId: true,
					storeName: true,
					discountStoreId: true,
					discount: {
						discountId: true,
						discountCode: true,
					},
				},
				relations: ["discount"],
				relationLoadStrategy: "join",
				take: limit,
				skip: offset,
			});

			return {
				total: countDiscountStore,
				data: findAllDiscountStore,
			};
		} catch (error) {
			throw error;
		}
	}

	async findDiscountTransaction({ discountId, storeId, fromDate, toDate }) {
		try {
			return await this.discountTransactionRepository
				.createQueryBuilder("discountTransaction")
				.innerJoinAndSelect(TransactionEntity, "transaction", "transaction.id = discountTransaction.transactionId")
				.where("discountTransaction.discountId = :discountId", {
					discountId: discountId,
				})
				.andWhere("discountTransaction.storeId = :storeId", {
					storeId: storeId,
				})
				.andWhere("transaction.transactionDate >= :fromDate", {
					fromDate: `'${fromDate}'`,
				})
				.andWhere("transaction.transactionDate <= :toDate", {
					toDate: `${toDate}'`,
				})
				.getRawMany();
		} catch (error) {
			throw error;
		}
	}

	async findTransactionRefunds(storeId: number, fromDate: Date, toDate: Date, offset: number, limit: number) {
		try {
			const subQuery = this.transactionRepository
				.createQueryBuilder("transaction")
				.innerJoin(RefundEntity, "refund", "transaction.id = refund.transaction")
				.innerJoin(ContactInformationEntity, "contactInfo", "transaction.customer = contactInfo.customer")
				.select([
					"transaction.id",
					"transaction.note",
					"transaction.transactionDate",
					"transaction.createdAt",
					"transaction.totalValue",
					"transaction.totalCost",
					"transaction.totalDiscount",
					"transaction.serviceChargeRate",
					"transaction.tip",
					"transaction.refund",
					"transaction.salesTaxRate",
					"transaction.paymentType",
					"transaction.status",
					"transaction.type",
					"contactInfo.firstName",
					"contactInfo.lastName",
					"refund.refund_number as refund_number",
					"refund.refund_reason as refund_reason",
				]);

			subQuery.where("transaction.store = :storeId", { storeId: storeId });
			this.applyDateFilter("transaction", subQuery, fromDate, toDate);
			subQuery.orderBy("transaction.createdAt", "DESC");

			const count = await subQuery.getRawMany();

			const paginatedQuery = this.entityManager
				.createQueryBuilder()
				.select("subQuery.*")
				.from(`(${subQuery.getQuery()})`, "subQuery")
				.setParameters(subQuery.getParameters())
				.take(limit)
				.skip(offset);

			const result = await paginatedQuery.getRawMany();

			return {
				count: count.length,
				data: result,
			};
		} catch (error) {
			throw error;
		}
	}

	async findAllFailedTransaction(storeId: number, fromDate: Date, toDate: Date, offset: number, limit: number) {
		try {
			const subQuery = this.transactionRepository
				.createQueryBuilder("transaction")
				.leftJoin("transaction.transactionItems", "transactionItem")
				.select([
					"transaction.createdAt as transactionDate",
					"COUNT(transactionItem.id) as transactionItemCount",
					"COUNT(transaction.id) as transactionCount",
					"SUM(transaction.totalValue) as totalTransactionValue",
					"SUM(transaction.tip) as totalTip",
				])
				.where("transaction.store = :storeId", { storeId: storeId })
				.andWhere("transaction.status = :status", { status: TransactionStatus.FAIL })
				.groupBy("transaction.createdAt")
				.orderBy("transaction.createdAt", "DESC");

			this.applyDateFilter("transaction", subQuery, fromDate, toDate);

			const paginatedQuery = this.entityManager
				.createQueryBuilder()
				.select("subQuery.*")
				.from(`(${subQuery.getQuery()})`, "subQuery")
				.setParameters(subQuery.getParameters())
				.take(limit)
				.skip(offset);

			const result = await paginatedQuery.getRawMany();

			return {
				count: await subQuery.getCount(),
				data: result,
			};
		} catch (error) {
			throw error;
		}
	}

	async findRevenue(storeId: number, fromDate: Date, toDate: Date, offset: number, limit: number) {
		try {
			const subQuery = this.transactionRepository
				.createQueryBuilder("transaction")
				.select([
					"DATE(transaction.createdAt) as transactionDate",
					"COUNT(transaction.id) as transactionCount",
					"SUM(transaction.totalValue) as revenue",
					"SUM(transaction.totalDiscount) as discounts",
				])
				.where("transaction.store = :storeId", { storeId: storeId })
				.andWhere("transaction.status = :status", { status: TransactionStatus.COMPLETED })
				.groupBy("DATE(transaction.createdAt)")
				.orderBy("transaction.createdAt", "DESC");

			this.applyDateFilter("transaction", subQuery, fromDate, toDate);

			const paginatedQuery = this.entityManager
				.createQueryBuilder()
				.select("subQuery.*")
				.from(`(${subQuery.getQuery()})`, "subQuery")
				.setParameters(subQuery.getParameters())
				.take(limit)
				.skip(offset);

			const result = await paginatedQuery.getRawMany();

			return {
				count: await subQuery.getCount(),
				data: result,
			};
		} catch (error) {
			throw error;
		}
	}

	async findEndOfDay(storeId: number, fromDate: Date, toDate: Date, offset: number, limit: number) {
		try {
			const subQuery = this.transactionRepository
				.createQueryBuilder("transaction")
				.select([
					"DATE(transaction.createdAt) as transactionDate",
					"COUNT(transaction.id) as totalTransaction",
					"SUM(transaction.totalValue) as revenue",
					"SUM(CASE WHEN transaction.paymentType == 'cash' then 1 else 0 END) as cashPayment",
					"SUM(CASE WHEN transaction.paymentType like '%card' then 1 else 0 END) as cardPayment",
					"SUM(transaction.tip) as tip",
					"SUM(transaction.serviceChargeRate) as serviceCharge",
					"AVG(transaction.totalValue) as averageValue",
					"0 as deliveryFee", //TODO: not define in schema
					"SUM(transaction.totalDiscount) as discount",
					"0 as quantityRefund",
					"SUM(transaction.refund) as totalRefund",
				])
				.where("transaction.store = :storeId", { storeId: storeId })
				.andWhere("transaction.status = :status", { status: TransactionStatus.COMPLETED })
				.groupBy("DATE(transaction.createdAt)")
				.orderBy("transaction.createdAt", "ASC");

			this.applyDateFilter("transaction", subQuery, fromDate, toDate);

			const paginatedQuery = this.entityManager
				.createQueryBuilder()
				.select("subQuery.*")
				.from(`(${subQuery.getQuery()})`, "subQuery")
				.setParameters(subQuery.getParameters())
				.take(limit)
				.skip(offset);

			const result = await paginatedQuery.getRawMany();

			return {
				count: await subQuery.getCount(),
				data: result,
			};
		} catch (error) {
			throw error;
		}
	}

	async findAverageOrder(storeId: number, fromDate: Date, toDate: Date, offset: number, limit: number) {
		try {
			const subQuery = this.transactionRepository
				.createQueryBuilder("transaction")
				.select([
					"DATE(transaction.createdAt) as transactionDate",
					"SUM(transaction.totalValue) as revenue",
					"COUNT(transaction.id) as totalTransaction",
					"AVG(transaction.totalValue) as averageValue",
				])
				.where("transaction.store = :storeId", { storeId: storeId })
				.andWhere("transaction.status = :status", { status: TransactionStatus.COMPLETED })
				.groupBy("DATE(transaction.createdAt)")
				.orderBy("transaction.createdAt", "ASC");

			this.applyDateFilter("transaction", subQuery, fromDate, toDate);

			const paginatedQuery = this.entityManager
				.createQueryBuilder()
				.select("subQuery.*")
				.from(`(${subQuery.getQuery()})`, "subQuery")
				.setParameters(subQuery.getParameters())
				.take(limit)
				.skip(offset);

			const result = await paginatedQuery.getRawMany();

			return {
				count: await subQuery.getCount(),
				data: result,
			};
		} catch (error) {
			throw error;
		}
	}

	async findDayOfWeek(storeId: number, fromDate: Date, toDate: Date, offset: number, limit: number) {
		try {
			const subQuery = this.transactionRepository
				.createQueryBuilder("transaction")
				.select([
					"DATE(transaction.createdAt) as transactionDate",
					"COUNT(transaction.id) as totalTransaction",
					"SUM(transaction.totalValue) as revenue",
				])
				.where("transaction.store = :storeId", { storeId: storeId })
				.andWhere("transaction.status = :status", { status: TransactionStatus.COMPLETED })
				.groupBy("DATE(transaction.createdAt)");

			this.applyDateFilter("transaction", subQuery, fromDate, toDate);

			const paginatedQuery = this.entityManager
				.createQueryBuilder()
				.select("subQuery.*")
				.from(`(${subQuery.getQuery()})`, "subQuery")
				.setParameters(subQuery.getParameters())
				.take(limit)
				.skip(offset);

			const result = await paginatedQuery.getRawMany();

			return {
				count: await subQuery.getCount(),
				data: result,
			};
		} catch (error) {
			throw error;
		}
	}

	private applyDateFilter(tableAlias: string, query: SelectQueryBuilder<TransactionEntity>, fromDate: Date, toDate: Date) {
		const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

		query.andWhere(`${tableAlias}.createdAt BETWEEN :fromDate AND :toDate`, {
			fromDate,
			toDate: toDate || currentDate,
		});
	}
}
