import { Injectable, NotFoundException } from "@nestjs/common";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { FailedFilterDto } from "../dtos/failed-filter.dto";
import { SalesRepository } from "../sales.repository";

@Injectable()
export class SalesFailedService {
	constructor(private readonly salesRepository: SalesRepository) { }

	async findFailedTransactionAll(filterData: FailedFilterDto) {
		try {
			const { page = 1, limit = 10 } = filterData;
			const offset = (page - 1) * limit;
			const { storeId, fromDate, toDate } = filterData;

			const result = await this.salesRepository.findAllFailedTransaction(storeId, fromDate, toDate, offset, limit);

			if (result.count === 0) {
				throw new NotFoundException(analyticsResponseMessage.ANALYTICS_FAILED_TRANSACTION_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}

			return {
				failed: result.data,
				pagination: {
					totalPages: Math.ceil(result.count / limit),
					currentPage: parseInt(page.toString()),
				},
			};
		} catch (error) {
			throw error;
		}
	}
}
