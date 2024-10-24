import { Injectable, NotFoundException } from "@nestjs/common";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { RevenueFilterDto } from "../dtos/revenue-filter.dto";
import { SalesRepository } from "../sales.repository";

@Injectable()
export class SalesRevenueService {
	constructor(private salesRepository: SalesRepository) { }

	async getRevenue(filterData: RevenueFilterDto) {
		try {
			const { page = 1, limit = 10 } = filterData;
			const offset = (page - 1) * limit;
			const { storeId, fromDate, toDate } = filterData;

			const revenue = await this.salesRepository.findRevenue(storeId, fromDate, toDate, offset, limit);
			if (revenue.data.length === 0) {
				throw new NotFoundException(analyticsResponseMessage.ANALYTICS_REVENUE_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}

			//create summary of revenue
			let totalOrders = 0;
			let totalSales = 0;
			let totalDiscount = 0;
			revenue.data.forEach(element => {
				totalOrders += element.transactionCount;
				totalSales += element.revenue;
				totalDiscount += element.discounts;
			});

			return {
				revenue: revenue.data,
				summary: {
					totalOrders,
					totalSales,
					totalDiscount,
				},
				pagination: {
					totalPages: Math.ceil(revenue.count / limit),
					currentPage: parseInt(page.toString()),
				},
			};
		} catch (error) {
			throw error;
		}
	}
}
