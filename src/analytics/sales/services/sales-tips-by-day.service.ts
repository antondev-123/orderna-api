import { Injectable, NotFoundException } from "@nestjs/common";
import { SalesRepository } from "../sales.repository";
import { analyticsResponseMessage } from "src/common/constants/response-messages/analytics.response-message";
import { errorResponseMessage } from "src/common/constants";
import { TipsByDayFilterDto } from "../dtos/tips-by-day-filter.dto";

@Injectable()
export class SalesTipsByDayService {
    constructor(
        private salesRepository: SalesRepository,
    ) { }

    async getTipsByDay(filterDto: TipsByDayFilterDto) {
        try {
            const { page = 1, limit = 10 } = filterDto;
            const offset = (page - 1) * limit;
            const { storeId, fromDate, toDate } = filterDto;

            const tipsByDay = await this.salesRepository.getTipsByDay(storeId, fromDate, toDate, offset, limit)

            if (tipsByDay.data.length === 0) {
                throw new NotFoundException(analyticsResponseMessage.ANALYTICS_TIPS_BY_DAY.EN, errorResponseMessage.NOT_FOUND.EN);
            }

            return {
                tips: tipsByDay.data,
                pagination: {
                    totalPages: Math.ceil(tipsByDay.count / limit),
                    currentPage: parseInt(page.toString()),
                },
            };
        } catch (error) {
            throw error;
        }
    }

}