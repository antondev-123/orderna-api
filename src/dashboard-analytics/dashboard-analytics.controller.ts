import { Controller, Get, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { dashboardResponseMessage, errorResponseMessage, swaggerConstant, urlsConstant } from "src/common/constants";
import { ResponseSerializer } from "src/common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "src/common/dtos/error-response.dto";
import { SuccessResponseDto } from "src/common/dtos/success-response.dto";
import { CompareStoresDto } from "./dtos/compare-stores.dto";
import { GetBestSellersDto } from "./dtos/get-best-sellers.dto";
import { GetTotalSalesDto } from "./dtos/get-total-sales.dto";
import { GetTotalTransactionsDto } from "./dtos/get-total-transactions.dto";
import { DashboardAnalyticsService } from "./dashboard-analytics.service";

@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@UseGuards(AuthGuard)
@ApiTags("Dashboard Analytics")
@Controller(urlsConstant.ROUTE_PREFIX_DASHBOARD_ANALYTICS)
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
export class DashboardAnalyticsController {
	constructor(private readonly dashboardAnalyticsService: DashboardAnalyticsService) {}

	@Get(urlsConstant.API_GET_DASHBOARD_SALES_SUMMARY)
	@ResponseSerializer(HttpStatus.OK, dashboardResponseMessage.GET_DASHBOARD_SALES_SUMMARY)
	@ApiOperation({ summary: "Get sales summary" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: dashboardResponseMessage.GET_DASHBOARD_SALES_SUMMARY.EN,
		type: SuccessResponseDto,
	})
	async getTotalTransactions(@Query() dto: GetTotalTransactionsDto) {
		try {
			return await this.dashboardAnalyticsService.getSalesSummary(dto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_DASHBOARD_TOTAL_SALES)
	@ResponseSerializer(HttpStatus.OK, dashboardResponseMessage.GET_DASHBOARD_TOTAL_SALES)
	@ApiOperation({ summary: "Get total sales" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: dashboardResponseMessage.GET_DASHBOARD_TOTAL_SALES.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: dashboardResponseMessage.GET_DASHBOARD_TOTAL_SALES_NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	async getTotalSales(@Query() dto: GetTotalSalesDto) {
		try {
			return await this.dashboardAnalyticsService.getTotalSales(dto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_DASHBOARD_COMPARE_STORES)
	@ResponseSerializer(HttpStatus.OK, dashboardResponseMessage.GET_DASHBOARD_COMPARE_STORES)
	@ApiOperation({ summary: "Compare stores" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: dashboardResponseMessage.GET_DASHBOARD_COMPARE_STORES.EN,
		type: SuccessResponseDto,
	})
	async compareStores(@Query() dto: CompareStoresDto) {
		try {
			return await this.dashboardAnalyticsService.getCompareStores(dto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_BEST_SELLERS)
	@ResponseSerializer(HttpStatus.OK, dashboardResponseMessage.GET_DASHBOARD_BEST_PRODUCT)
	@ApiOperation({ summary: "Get best sellers" })
	@ApiResponse({ status: HttpStatus.OK, type: SuccessResponseDto })
	async getBestSellers(@Query() dto: GetBestSellersDto) {
		try {
			return await this.dashboardAnalyticsService.getBestSellers(dto);
		} catch (error) {
			throw error;
		}
	}
}
