import { Injectable, NotFoundException } from "@nestjs/common";
import { RegisterRepository } from "./register.repository";
import { RegisterDto } from "./dtos/register.dto";
import { TransactionRepository } from "../../transaction/repositories/transaction.repository";
import { errorResponseMessage } from "../../common/constants";
import { analyticsResponseMessage } from "../../common/constants/response-messages/analytics.response-message";

@Injectable()
export class RegisterService {
	constructor(
		private readonly registerRepository: RegisterRepository,
		private readonly transactionRepository: TransactionRepository,
	) {}

	async getRegisterSummary(filterData: RegisterDto) {
		try {
			const { page = 1, limit = 10 } = filterData;
			const offset = (page - 1) * limit;
			const { storeId, fromDate, toDate } = filterData;

			const registerSummary = await this.registerRepository.findCashRegister(storeId, fromDate, toDate, offset, limit);
			if (registerSummary.data.length === 0) {
				throw new NotFoundException(analyticsResponseMessage.ANALYTICS_REGISTER_SUMMARY_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}
			const transactionSummary = await this.transactionRepository.summaryTransactionByPaymentType({
				storeId,
				fromDate,
				toDate,
			});

			const data = [];
			registerSummary.data.forEach(register => {
				const totalCash = register.cashManagementEntity.reduce((acc, curr) => acc + (curr.cashIn - curr.cashOut), 0);
				const transaction = transactionSummary.find(transaction => {
					const datetimeTransaction = new Date(transaction.transactionDate);
					const dateTransaction = datetimeTransaction.toISOString().slice(0, 10);

					const datetimeRegister = new Date(register.createdAt);
					const dateRegister = datetimeRegister.toISOString().slice(0, 10);

					return dateTransaction === dateRegister;
				});

				const totalAllPayment =
					totalCash +
					transaction?.cashTotal +
					transaction?.creditCardTotal +
					transaction?.debitCardTotal +
					transaction?.gCashTotal -
					transaction?.refundTotal;

				data.push({
					id: register.id,
					createdAt: register.createdAt,
					registerName: register.registerName,
					opened: register.opened,
					closed: register.closed,
					storeName: register.store.Name,
					cash: totalCash,
					storeCredit: transaction?.refundTotal || 0,
					total: totalAllPayment || 0,
				});
			});

			return {
				registerSummary: data,
				pagination: {
					totalPages: Math.ceil(registerSummary.count / limit),
					currentPage: page,
				},
			};
		} catch (error) {
			throw error;
		}
	}
}
