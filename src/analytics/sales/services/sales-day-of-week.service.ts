import { Injectable, NotFoundException } from "@nestjs/common";
import { errorResponseMessage } from "../../../common/constants";
import { analyticsResponseMessage } from "../../../common/constants/response-messages/analytics.response-message";
import { DayOfWeekFilterDto } from "../dtos/day-of-week.filter.dto";
import { SalesRepository } from "../sales.repository";

@Injectable()
export class SalesDayOfWeekService {
	constructor(private salesRepository: SalesRepository) { }

	async getSalesByDayOfWeek(filterData: DayOfWeekFilterDto) {
		try {
			const { page = 1, limit = 10 } = filterData;
			const offset = (page - 1) * limit;
			const { storeId, fromDate, toDate } = filterData;

			const salesByDayOfWeek = await this.salesRepository.findDayOfWeek(storeId, fromDate, toDate, offset, limit);

			if (salesByDayOfWeek.data.length === 0) {
				throw new NotFoundException(analyticsResponseMessage.ANALYTICS_DAY_OF_WEEK_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}

			salesByDayOfWeek.data.forEach(element => {
				const date = new Date(element.transactionDate);
				element.dayOfWeek = date.toLocaleString("en-US", { weekday: "long" });
			});

			salesByDayOfWeek.data.sort((a, b) => {
				const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
				return dayOfWeek.indexOf(a.dayOfWeek) - dayOfWeek.indexOf(b.dayOfWeek);
			});

			salesByDayOfWeek.data.forEach(element => {
				delete element.transactionDate;
			});

			return {
				dayOfWeek: salesByDayOfWeek.data,
				pagination: {
					totalPages: Math.ceil(salesByDayOfWeek.count / limit),
					currentPage: parseInt(page.toString()),
				},
			};
		} catch (error) {
			throw error;
		}
	}
}
