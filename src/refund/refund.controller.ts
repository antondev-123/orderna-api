import { Body, Controller, Get, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/guards/auth.guard";
import { errorResponseMessage, swaggerConstant, urlsConstant } from "../common/constants";
import { refundResponseMessage } from "../common/constants/response-messages/refund.response-message";
import { ResponseSerializer } from "../common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "../common/dtos/error-response.dto";
import { SuccessResponseDto } from "../common/dtos/success-response.dto";
import { CreateRefundDto } from "./dto/create-refund.dto";
import { FilterRefundDto } from "./dto/filter-refund.dto";
import { RefundService } from "./refund.service";

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@Controller(urlsConstant.ROUTE_PREFIX_REFUND)
@ApiTags("Refunds")
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
export class RefundController {
	constructor(private readonly refundService: RefundService) { }

	@Post()
	@ResponseSerializer(HttpStatus.CREATED, refundResponseMessage.ADD_REFUND.EN)
	@ApiOperation({
		summary: "Add refund transaction",
		description: "Add refund transaction",
	})
	@ApiResponse({ status: HttpStatus.CREATED, description: refundResponseMessage.ADD_REFUND.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Transaction not found.", type: ErrorResponseDto })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: errorResponseMessage.BAD_REQUEST.EN, type: ErrorResponseDto })
	create(@Body() createRefundDto: CreateRefundDto) {
		return this.refundService.create(createRefundDto);
	}

	@Get()
	@ResponseSerializer(HttpStatus.OK, refundResponseMessage.GET_REFUND_LIST.EN)
	@ApiOperation({
		summary: "Get refund transaction",
		description: "Get refund transactions",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: refundResponseMessage.GET_REFUND_LIST.EN,
		type: SuccessResponseDto,
	})
	findAll(@Query() filterRefundDto: FilterRefundDto) {
		return this.refundService.findAll(filterRefundDto);
	}

	@Get(":id")
	@ResponseSerializer(HttpStatus.OK, refundResponseMessage.GET_REFUND_LIST.EN)
	@ApiOperation({
		summary: "Get refund transaction by id",
		description: "Get refund transaction by id",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: refundResponseMessage.GET_REFUND_LIST.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: errorResponseMessage.NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	findOne(@Param("id") id: string) {
		return this.refundService.findOne(+id);
	}
}
