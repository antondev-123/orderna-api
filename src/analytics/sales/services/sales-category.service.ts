import { Injectable, NotFoundException } from "@nestjs/common";
import { SalesRepository } from "../sales.repository";
import { analyticsResponseMessage } from "src/common/constants/response-messages/analytics.response-message";
import { errorResponseMessage } from "src/common/constants";
import { CategoryFilterDto } from "../dtos/category-filter.dto";

@Injectable()
export class SalesCategoryService {
    constructor(
        private salesRepository: SalesRepository,
    ) { }

    async getCategories(filterDto: CategoryFilterDto) {
        try {
            const { page = 1, limit = 10 } = filterDto;
            const offset = (page - 1) * limit;
            const { storeId, fromDate, toDate } = filterDto;

            const category = await this.salesRepository.getCategories(storeId, fromDate, toDate)

            if (category.data.length === 0) {
                throw new NotFoundException(analyticsResponseMessage.ANALYTICS_CATEGORIES.EN, errorResponseMessage.NOT_FOUND.EN);
            }

            const result = category.data.reduce((acc, curr) => {
                const found = acc.find(item => item.category_name === curr.category_name);
                if (found) {
                    found.sold += 1;
                    found.revenue += curr.totalValue;
                } else {
                    acc.push({
                        category_name: curr.category_name,
                        sold: 1,
                        revenue: curr.totalValue
                    });
                }
                return acc;
            }, []);

            const paginateResult = result.slice(offset, offset + limit);

            return {
                category: paginateResult,
                pagination: {
                    totalPages: Math.ceil(paginateResult.length / limit),
                    currentPage: page,
                }
            }

        } catch (error) {
            throw error;
        }
    }

}
