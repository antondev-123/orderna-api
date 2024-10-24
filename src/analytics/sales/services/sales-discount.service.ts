import { Injectable, NotFoundException } from "@nestjs/common";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { TransactionRepository } from "../../../transaction/repositories/transaction.repository";
import { DiscountFilterDto } from "../dtos/discount-filter.dto";
import { SalesRepository } from "../sales.repository";

@Injectable()
export class SalesDiscountService {
	constructor(
		private readonly discountStoreRepository: SalesRepository,
		private readonly transactionRepository: TransactionRepository,
	) { }

	async getDiscountsSummary(filterData: DiscountFilterDto) {
		try {
			const discountStore = await this.discountStoreRepository.findDiscountStore({
				storeId: filterData.storeId,
				limit: filterData.limit,
				page: filterData.page,
			});

			if (discountStore.total === 0) {
				throw new NotFoundException(analyticsResponseMessage.ANALYTICS_DISCOUNT_SUMMARY_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}

			//looping through the discountStore to get the total discount amount
			for (let i = 0; i < discountStore.data.length; i++) {
				const totalDiscountAmount = await this.discountStoreRepository.findDiscountTransaction({
					discountId: discountStore.data[i].discount.discountId,
					storeId: discountStore.data[i].storeId,
					fromDate: filterData.fromDate,
					toDate: filterData.toDate,
				});

				discountStore.data[i]["usageCount"] = totalDiscountAmount.length;
				discountStore.data[i]["totalRedeemed"] = totalDiscountAmount.reduce(
					(accumulator, currentValue) => accumulator + currentValue.discountTransaction_amount,
					0,
				);

				//average transaction value (total transaction value in TransactionEntity / number of transactions in Transaction Entity)
				discountStore.data[i]["averageTransactionValue"] = totalDiscountAmount.reduce(
					(accumulator, currentValue) => accumulator + currentValue.transaction_totalValue / totalDiscountAmount.length,
					0,
				);
			}

			const data = discountStore.data.map(item => ({
				storeId: item.storeId,
				storeName: item.storeName,
				discountStoreId: item.discountStoreId,
				discountCode: item.discount.discountCode,
				usageCount: item["usageCount"],
				totalRedeemed: item["totalRedeemed"],
				averageTransactionValue: item["averageTransactionValue"],
			}));

			return {
				summary: data,
				pagination: {
					totalPages: Math.ceil(discountStore.total / filterData.limit),
					currentPage: parseInt(filterData.page.toString()),
				},
			};
		} catch (error) {
			throw error;
		}
	}

	async getDiscountTransaction(filterData: DiscountFilterDto) {
		try {
			const count = await this.transactionRepository.findCountTransaction({
				storeId: filterData.storeId,
				fromDate: filterData.fromDate,
				toDate: filterData.toDate,
			});

			if (count === 0) {
				throw new NotFoundException(analyticsResponseMessage.ANALYTICS_DISCOUNT_TRANSACTION_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}

			const discountTransaction = await this.transactionRepository.findDiscountTransaction({
				storeId: filterData.storeId,
				fromDate: filterData.fromDate,
				toDate: filterData.toDate,
				limit: filterData.limit,
				page: filterData.page,
			});

			return {
				transaction: discountTransaction,
				pagination: {
					totalPages: Math.ceil(count / filterData.limit),
					currentPage: parseInt(filterData.page.toString()),
				},
			};
		} catch (error) {
			throw error;
		}
	}
}
