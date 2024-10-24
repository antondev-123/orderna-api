import { Controller, Get, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { errorResponseMessage, swaggerConstant, urlsConstant } from "src/common/constants";
import { analyticsResponseMessage } from "src/common/constants/response-messages/analytics.response-message";
import { ResponseSerializer } from "src/common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "src/common/dtos/error-response.dto";
import { SuccessResponseDto } from "src/common/dtos/success-response.dto";
import { AccountingService } from "./accounting.service";
import { AllTransactionsResultDto } from "./dtos/all-transactions-result.dto";
import { AnalyticsFilterDto } from "./dtos/analytics-filter.dto";
import { DailySummaryResultDto } from "./dtos/daily-summary-result.dto";
import { TransactionAnalyticsFilterDto } from "./dtos/transaction-analytics-filter.dto";

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@ApiTags("Analytics")
@Controller(urlsConstant.ROUTE_PREFIX_ACCOUNTING_ANALYTICS)
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
export class AccountingController {
	constructor(private accountingService: AccountingService) { }

	@Get(urlsConstant.API_GET_ACCOUNTING_DAILY_SUMMARY)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_ACCOUNTING_DAILY_SUMMARY, DailySummaryResultDto)
	@ApiOperation({ summary: "Get daily summary" })
	@ApiResponse({ status: HttpStatus.OK, description: analyticsResponseMessage.GET_ANALYTICS_ACCOUNTING_DAILY_SUMMARY.EN, type: SuccessResponseDto })
	async getdailySummary(@Query() filterDto: AnalyticsFilterDto) {
		try {
			return await this.accountingService.getDailySummary(filterDto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_ACCOUNTING_ALL_TRANSACTIONS)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_ACCOUNTING_ALL_TRANSACTIONS, AllTransactionsResultDto)
	@ApiOperation({ summary: "Get all transactions" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.GET_ANALYTICS_ACCOUNTING_ALL_TRANSACTIONS.EN,
		type: SuccessResponseDto,
	})
	async getAllTransactions(@Query() filterDto: TransactionAnalyticsFilterDto) {
		try {
			return await this.accountingService.getAllTransactions(filterDto);
		} catch (error) {
			throw error;
		}
	}
}
