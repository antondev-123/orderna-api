import { Injectable, NotFoundException } from "@nestjs/common";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { RefundFilterDto } from "../dtos/refund-filter.dto";
import { SalesRepository } from "../sales.repository";

@Injectable()
export class SalesRefundService {
	constructor(private salesRepository: SalesRepository) { }

	async findRefundTransactionAll(filterData: RefundFilterDto) {
		try {
			const { page = 1, limit = 10 } = filterData;
			const offset = (page - 1) * limit;
			const { storeId, fromDate, toDate } = filterData;

			const refunds = await this.salesRepository.findTransactionRefunds(storeId, fromDate, toDate, offset, limit);

			if (refunds.data.length === 0) {
				throw new NotFoundException(analyticsResponseMessage.ANALYTICS_REFUND_TRANSACTION_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}

			return {
				refunds: refunds.data,
				pagination: {
					totalPages: Math.ceil(refunds.count / limit),
					currentPage: parseInt(page.toString()),
				},
			};
		} catch (error) {
			throw error;
		}
	}
}
