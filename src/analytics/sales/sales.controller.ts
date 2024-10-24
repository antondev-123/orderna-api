import { Controller, Get, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { errorResponseMessage, swaggerConstant, urlsConstant } from "../../common/constants";
import { analyticsResponseMessage } from "../../common/constants/response-messages/analytics.response-message";
import { ResponseSerializer } from "../../common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "../../common/dtos/error-response.dto";
import { SuccessResponseDto } from "../../common/dtos/success-response.dto";
import { DiscountFilterDto } from "./dtos/discount-filter.dto";
import { RefundFilterDto } from "./dtos/refund-filter.dto";
import { SalesAverageOrderService } from "./services/sales-average-order.service";
import { SalesDayOfWeekService } from "./services/sales-day-of-week.service";
import { SalesDiscountService } from "./services/sales-discount.service";
import { SalesEndOfDayService } from "./services/sales-end-of-day.service";
import { SalesFailedService } from "./services/sales-failed.service";
import { SalesRefundService } from "./services/sales-refund.service";
import { SalesRevenueService } from "./services/sales-revenue.service";
import { ProductFilterDto } from "./dtos/product-filter.dto";
import { SalesProductService } from "./services/sales-product.service";
import { SalesCategoryService } from "./services/sales-category.service";
import { SalesTimeOfDayService } from "./services/sales-time-of-day.service";
import { TimeOfDayFilterDto } from "./dtos/time-of-day.dto";
import { CategoryFilterDto } from "./dtos/category-filter.dto";
import { SalesTipsByDayService } from "./services/sales-tips-by-day.service";
import { TipsByDayFilterDto } from "./dtos/tips-by-day-filter.dto";

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@Controller(urlsConstant.ROUTE_PREFIX_DISCOUNT_ANALYTICS)
@ApiTags("Analytics")
@ApiResponse({
	status: HttpStatus.INTERNAL_SERVER_ERROR,
	description: errorResponseMessage.INTERNAL_SERVER_ERROR.EN,
	type: ErrorResponseDto,
})
@ApiResponse({
	status: HttpStatus.UNPROCESSABLE_ENTITY,
	description: errorResponseMessage.UNPROCESSABLE_ENTITY.EN,
	type: ErrorResponseDto,
})
@ApiResponse({
	status: HttpStatus.UNAUTHORIZED,
	description: errorResponseMessage.UNAUTHORIZED.EN,
	type: ErrorResponseDto,
})
@ApiResponse({
	status: HttpStatus.BAD_REQUEST,
	description: errorResponseMessage.BAD_REQUEST.EN,
	type: ErrorResponseDto,
})
@ApiResponse({
	status: HttpStatus.NOT_FOUND,
	description: errorResponseMessage.NOT_FOUND.EN,
	type: ErrorResponseDto,
})
export class SalesController {
	constructor(
		private readonly discountService: SalesDiscountService,
		private readonly refundService: SalesRefundService,
		private readonly failedService: SalesFailedService,
		private readonly revenueService: SalesRevenueService,
		private readonly endOfDayService: SalesEndOfDayService,
		private readonly averageOrderService: SalesAverageOrderService,
		private readonly dayOfWeekService: SalesDayOfWeekService,
		private readonly productService: SalesProductService,
		private readonly categoryService: SalesCategoryService,
		private readonly timeOfDayService: SalesTimeOfDayService,
		private readonly tipsByDayService: SalesTipsByDayService
	) { }

	@Get(urlsConstant.API_GET_SALES_TIME_OF_DAY)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_SALES_TIME_OF_DAY)
	@ApiOperation({
		summary: 'Get sales time of day',
		description: 'Get sales time of day filtered by period and store'
	})
	@ApiResponse({ status: HttpStatus.OK, description: analyticsResponseMessage.GET_ANALYTICS_SALES_TIME_OF_DAY.EN, type: SuccessResponseDto })
	async getTimeOfDay(@Query() filterDto: TimeOfDayFilterDto) {
		try {
			return await this.timeOfDayService.getTimeOfDay(filterDto)
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_SALES_PRODUCTS)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_PRODUCTS)
	@ApiOperation({
		summary: 'Get sales by products',
		description: 'Get sales by products filtered by period and store'
	})
	@ApiResponse({ status: HttpStatus.OK, description: analyticsResponseMessage.GET_ANALYTICS_PRODUCTS.EN, type: SuccessResponseDto })
	async getProducts(@Query() filterDto: ProductFilterDto) {
		try {
			return await this.productService.getProducts(filterDto)
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_SALES_CATEGORIES)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_CATEGORIES)
	@ApiOperation({
		summary: 'Get sales categories',
		description: 'Get sales by categories filtered by period and store'
	})
	@ApiResponse({ status: HttpStatus.OK, description: analyticsResponseMessage.GET_ANALYTICS_CATEGORIES.EN, type: SuccessResponseDto })
	async getCategories(@Query() filterDto: CategoryFilterDto) {
		try {
			return await this.categoryService.getCategories(filterDto)
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_SALES_TIPS_BY_DAY)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_TIPS_BY_DAY)
	@ApiOperation({
		summary: 'Get sales tips by day',
		description: 'Get sales tips by day filtered by period and store'
	})
	@ApiResponse({ status: HttpStatus.OK, description: analyticsResponseMessage.GET_ANALYTICS_TIPS_BY_DAY.EN, type: SuccessResponseDto })
	async getTipsByDay(@Query() filterDto: TipsByDayFilterDto) {
		try {
			return await this.tipsByDayService.getTipsByDay(filterDto)
		} catch (error) {
			throw error;
		}
	}



	@Get(urlsConstant.API_GET_ANALYTICS_DISCOUNT_SUMMARY)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.ANALYTICS_DISCOUNT_SUMMARY)
	@ApiOperation({
		summary: "Get discount summary",
		description: "Get discounts filtered by period and store",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.ANALYTICS_DISCOUNT_SUMMARY.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: errorResponseMessage.NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	async getDiscountsSummary(@Query() filter: DiscountFilterDto) {
		try {
			return this.discountService.getDiscountsSummary({
				page: filter.page,
				limit: filter.limit,
				storeId: filter.storeId,
				fromDate: filter.fromDate,
				toDate: filter.toDate,
			});
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ANALYTICS_DISCOUNT_TRANSACTION)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.ANALYTICS_DISCOUNT_TRANSACTION)
	@ApiOperation({
		summary: "Get discount transaction",
		description: "Get discount transactions filtered by period and store",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.ANALYTICS_DISCOUNT_TRANSACTION.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: errorResponseMessage.NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	getDiscountTransaction(@Query() filter: DiscountFilterDto) {
		try {
			return this.discountService.getDiscountTransaction({
				page: filter.page,
				limit: filter.limit,
				storeId: filter.storeId,
				fromDate: filter.fromDate,
				toDate: filter.toDate,
			});
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ANALYTICS_REFUND_TRANSACTION)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_REFUND_TRANSACTION)
	@ApiOperation({
		summary: "Get refund transactions",
		description: "Get refund transactions filtered by period and store",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.GET_ANALYTICS_REFUND_TRANSACTION.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: errorResponseMessage.NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	async findRefundTransactionAll(@Query() filterData: RefundFilterDto) {
		try {
			return await this.refundService.findRefundTransactionAll(filterData);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ANALYTICS_FAILED_TRANSACTION)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_FAILED_TRANSACTION)
	@ApiOperation({
		summary: "Get failed transactions",
		description: "Get failed transactions filtered by period and store",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.GET_ANALYTICS_FAILED_TRANSACTION.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: errorResponseMessage.NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	async findFailedTransactionAll(@Query() filterData: DiscountFilterDto) {
		try {
			return this.failedService.findFailedTransactionAll(filterData);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ANALYTICS_REVENUE)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_REVENUE)
	@ApiOperation({
		summary: "Get revenue",
		description: "Get revenue filtered by period and store",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.GET_ANALYTICS_REVENUE.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: errorResponseMessage.NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	async findRevenue(@Query() filterData: DiscountFilterDto) {
		try {
			return this.revenueService.getRevenue(filterData);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ANALYTICS_END_OF_DAY)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_END_OF_DAY)
	@ApiOperation({
		summary: "Get end of day report",
		description: "Get end of day filtered by period and store",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.GET_ANALYTICS_END_OF_DAY.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: errorResponseMessage.NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	async findEndOfDay(@Query() filterData: DiscountFilterDto) {
		try {
			return this.endOfDayService.getEndOfDay(filterData);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ANALYTICS_AVERAGE_ORDER)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_AVERAGE_ORDER)
	@ApiOperation({
		summary: "Get average order",
		description: "Get average order filtered by period and store",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.GET_ANALYTICS_AVERAGE_ORDER.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: errorResponseMessage.NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	async findAverageOrder(@Query() filterData: DiscountFilterDto) {
		try {
			return this.averageOrderService.getAverageOrder(filterData);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ANALYTICS_DAY_OF_WEEK)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_DAY_OF_WEEK)
	@ApiOperation({
		summary: "Get sales by day of week",
		description: "Get sales by day of week filtered by period and store",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.GET_ANALYTICS_DAY_OF_WEEK.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: errorResponseMessage.NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	async findSalesByDayOfWeek(@Query() filterData: DiscountFilterDto) {
		try {
			return this.dayOfWeekService.getSalesByDayOfWeek(filterData);
		} catch (error) {
			throw error;
		}
	}
}
