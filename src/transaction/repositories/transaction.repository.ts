import { Injectable } from "@nestjs/common";
import { Between, Brackets, DataSource, Repository } from "typeorm";
import { PaymentType } from "../../common/constants";
import { GetTotalTransactionsDto } from "../../dashboard-analytics/dtos/get-total-transactions.dto";
import { DiscountTransactionEntity } from "../../discount/entities/discount-transactions.entity";
import { TransactionEntity } from "../entities/transaction.entity";

@Injectable()
export class TransactionRepository extends Repository<TransactionEntity> {
	constructor(private readonly dataSource: DataSource) {
		super(TransactionEntity, dataSource.createEntityManager());
	}

	async findTransactionById(transactionId) {
		try {
			const product = await this.findOne({
				where: {
					id: transactionId,
					deletedAt: null,
				},
				select: {
					transactionItems: {
						id: true,
						totalValue: true,
						totalCost: true,
						quantity: true,
						remainingAmount: true,
						remainingQuantity: true,
						product: {
							id: true,
							title: true,
						},
					},
				},
				relations: ["transactionItems", "transactionItems.product"],
			});
			return product;
		} catch (error) {
			throw error;
		}
	}

	async transactionUpdate(
		itemDetails: { sum: number; cost: number; discount: number },
		transactionId: string,
	) {
		try {
			const transaction = await this.update(transactionId, {
				totalValue: itemDetails.sum,
				totalCost: itemDetails.cost,
				totalDiscount: itemDetails.discount,
			});
			return transaction;
		} catch (error) {
			throw error;
		}
	}

	async findTransactionDetailsById(transactionId) {
		try {
			const transaction = await this.findOne({
				where: {
					id: transactionId,
					deletedAt: null,
				},
				relations: {
					store: true,
					customer: true,
				},
			});
			return transaction;
		} catch (error) {
			throw error;
		}
	}

	async deleteTransaction(transactionId) {
		try {
			return await this.update(
				{
					id: transactionId,
				},
				{
					deletedAt: new Date(),
				},
			);
		} catch (error) {
			throw error;
		}
	}

	async findTransactionList({
		store,
		paymentType,
		status,
		fromDate,
		toDate,
		search,
		skip,
		take,
	}: Partial<{
		store: string;
		paymentType: string;
		status: string;
		fromDate: Date;
		toDate: Date;
		search: string;
		skip: number;
		take: number;
	}>) {
		try {
			const currentDate = new Date()
				.toISOString()
				.slice(0, 19)
				.replace("T", " ");

			const query: any = this.createQueryBuilder("transaction")
				.leftJoinAndSelect("transaction.customer", "customer")
				.leftJoinAndSelect("customer.contactInfo", "contactInfo")
				.leftJoinAndSelect("transaction.store", "store")
				.leftJoin("transaction_item_entity", "t", "t.transaction = transaction.id")
				.addSelect("COUNT(t.id)", "transactionItemCount")
				.where("transaction.createdAt BETWEEN :fromDate AND :toDate", {
					fromDate,
					toDate: toDate || currentDate,
				})
				.groupBy("transaction.id")
				.addGroupBy("customer.id")
				.addGroupBy("contactInfo.id")
				.addGroupBy("store.id");

			if (store) {
				query.andWhere("store.Name = :store", { store: store });
			}
			if (status) {
				query.andWhere("transaction.status = :status", { status: status });
			}
			if (paymentType) {
				query.andWhere("transaction.paymentType = :paymentType", {
					paymentType,
				});
			}
			if (search) {
				const searchLower = search.toLowerCase();
				query.andWhere(
					new Brackets(qb => {
						qb.where("LOWER(contactInfo.firstName) LIKE :search", {
							search: `%${searchLower}%`,
						})
							.orWhere("LOWER(contactInfo.lastName) LIKE :search", {
								search: `%${searchLower}%`,
							})
							.orWhere(
								"LOWER(contactInfo.firstName || ' ' || contactInfo.lastName) LIKE :search",
								{ search: `%${searchLower}%` },
							);
					}),
				);
			}

			const count = await query.getCount();
			const transaction = await query.take(take).skip(skip).getMany();
			return [transaction, count];
		} catch (error) {
			throw error;
		}
	}

	async updateTransactionItems(data: {
		transactionId: number;
		productId: number;
		remainingQuantity: number;
		remainingAmount: number;
		isRefund: boolean;
	}) {
		try {
			return await this.createQueryBuilder("transaction")
				.update("transaction_item_entity")
				.set({
					remainingQuantity: data.remainingQuantity,
					remainingAmount: data.remainingAmount,
					isRefund: data.isRefund,
				})
				.where("transaction = :transactionId", {
					transactionId: data.transactionId,
				})
				.andWhere("product = :productId", { productId: data.productId })
				.execute();
		} catch (error) {
			throw error;
		}
	}

	async updateTransaction(data: {
		transactionId: number;
		refund: number;
		status: string;
	}) {
		try {
			return await this.createQueryBuilder("transaction")
				.update("transaction_entity")
				.set({ refund: data.refund, status: data.status })
				.where("id = :transactionId", { transactionId: data.transactionId })
				.execute();
		} catch (error) {
			throw error;
		}
	}

	async findDiscountTransaction({ storeId, fromDate, toDate, limit, page }) {
		const offset = (page - 1) * limit;

		return this.createQueryBuilder("transaction")
			.where("transaction.store = :storeId", {
				storeId: storeId,
			})
			.andWhere("transaction.transactionDate >= :fromDate", {
				fromDate: `'${fromDate}'`,
			})
			.andWhere("transaction.transactionDate <= :toDate", {
				toDate: `${toDate}'`,
			})
			.select([
				"transaction.id as transactionId",
				"transaction.transactionDate as transactionDate",
				"discountTransaction.discountCode as discountCode",
				"discountTransaction.discountType as discountType",
				"discountTransaction.customerName as customerName",
				"'' as transactionNumber", //not identification in schema
				"transaction.totalValue as transactionTotal",
				"discountTransaction.amount as discountAmount",
			])
			.leftJoin(
				DiscountTransactionEntity,
				"discountTransaction",
				"transaction.id = discountTransaction.transactionId",
			)
			.take(limit)
			.skip(offset)
			.getRawMany();
	}

	async findCountTransaction({ storeId, fromDate, toDate }) {
		return this.count({
			where: {
				store: {
					id: storeId,
				},
				transactionDate: Between(fromDate, toDate),
			},
			select: {
				id: true,
			},
		});
	}

	async summaryTransactionByPaymentType({ storeId, fromDate, toDate }) {
		return this.createQueryBuilder("transaction")
			.where("transaction.store = :storeId", {
				storeId: storeId,
			})
			.andWhere("transaction.transactionDate >= :fromDate", {
				fromDate: `'${fromDate}'`,
			})
			.andWhere("transaction.transactionDate <= :toDate", {
				toDate: `${toDate}'`,
			})
			.select([
				"transaction.createdAt as transactionDate",
				"COUNT(transaction.id) as transactionCount",
				"SUM(transaction.totalValue) as transactionTotal",
				"SUM(transaction.refund) as refundTotal",
				"SUM(transaction.totalCost) as totalCost",
				"SUM(transaction.totalDiscount) as totalDiscount",
				"AVG(transaction.totalValue) as averageTransaction",
				`SUM(CASE WHEN transaction.paymentType = '${PaymentType.CASH}' THEN transaction.totalValue ELSE 0 END) as cashTotal`,
				`SUM(CASE WHEN transaction.paymentType = '${PaymentType.CREDIT_CARD}' THEN transaction.totalValue ELSE 0 END) as creditCardTotal`,
				`SUM(CASE WHEN transaction.paymentType = '${PaymentType.DEBIT_CARD}' THEN transaction.totalValue ELSE 0 END) as debitCardTotal`,
				`SUM(CASE WHEN transaction.paymentType = '${PaymentType.G_CASH}' THEN transaction.totalValue ELSE 0 END) as gCashTotal`,
			])
			.groupBy("transaction.createdAt")
			.getRawMany();
	}

	async summaryTransactionByPeriod(dto: GetTotalTransactionsDto) {
		return (
			this.createQueryBuilder("transaction")
				.where("transaction.store = :storeId", {
					storeId: parseInt(dto.storeId.toString()),
				})
				// .andWhere("transaction.transactionDate >= :fromDate", {
				// 	fromDate: `'${fromDate}'`,
				// })
				// .andWhere("transaction.transactionDate <= :toDate", {
				// 	toDate: `${toDate}'`,
				// })
				.select([
					"transaction.createdAt as transactionDate",
					"COUNT(transaction.id) as transactionCount",
					"SUM(transaction.totalValue) as transactionTotal",
					"SUM(transaction.refund) as refundTotal",
					"SUM(transaction.totalCost) as totalCost",
					"SUM(transaction.totalDiscount) as totalDiscount",
					"AVG(transaction.totalValue) as averageTransaction",
				])
				.groupBy("transaction.createdAt")
				.getRawMany()
		);
	}
}
