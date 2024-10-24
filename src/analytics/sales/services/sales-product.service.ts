import { Injectable, NotFoundException } from "@nestjs/common";
import { SalesRepository } from "../sales.repository";
import { analyticsResponseMessage } from "src/common/constants/response-messages/analytics.response-message";
import { errorResponseMessage } from "src/common/constants";
import { ProductFilterDto } from "../dtos/product-filter.dto";

@Injectable()
export class SalesProductService {
    constructor(
        private salesRepository: SalesRepository,
    ) { }

    async getProducts(filterDto: ProductFilterDto) {
        try {
            const { page = 1, limit = 10 } = filterDto;
            const offset = (page - 1) * limit;
            const { storeId, fromDate, toDate } = filterDto;

            const product = await this.salesRepository.getProducts(storeId, fromDate, toDate)

            if (product.data.length === 0) {
                throw new NotFoundException(analyticsResponseMessage.ANALYTICS_PRODUCTS.EN, errorResponseMessage.NOT_FOUND.EN);
            }

            const result = product.data.reduce((acc, curr) => {
                const found = acc.find(item => item.product_title === curr.product_title);
                if (found) {
                    found.order += 1;
                    found.revenue += curr.totalValue;
                } else {
                    acc.push({
                        product_title: curr.product_title,
                        order: 1,
                        revenue: curr.totalValue
                    });
                }
                return acc;
            }, []);

            const paginateResult = result.slice(offset, offset + limit);

            return {
                product: paginateResult,
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