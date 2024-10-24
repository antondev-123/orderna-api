import { Injectable, NotFoundException } from "@nestjs/common";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { AverageOrderFilterDto } from "../dtos/average-order-filter.dto";
import { SalesRepository } from "../sales.repository";

@Injectable()
export class SalesAverageOrderService {
	constructor(private readonly salesRepository: SalesRepository) { }

	async getAverageOrder(filterData: AverageOrderFilterDto) {
		try {
			const { page = 1, limit = 10 } = filterData;
			const offset = (page - 1) * limit;
			const { storeId, fromDate, toDate } = filterData;

			const averageOrder = await this.salesRepository.findAverageOrder(storeId, fromDate, toDate, offset, limit);
			if (averageOrder.data.length == 0) {
				throw new NotFoundException(analyticsResponseMessage.ANALYTICS_AVERAGE_ORDER_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}

			return {
				averageOrder: averageOrder.data,
				pagination: {
					totalPages: Math.ceil(averageOrder.count / limit),
					currentPage: page,
				},
			};
		} catch (error) {
			throw error;
		}
	}
}
