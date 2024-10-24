import { Controller, Get, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { errorResponseMessage, swaggerConstant, urlsConstant } from "../../common/constants";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { ErrorResponseDto } from "../../common/dtos/error-response.dto";
import { ResponseSerializer } from "../../common/decorators/responseSerializer.decorator";
import { analyticsResponseMessage } from "../../common/constants/response-messages/analytics.response-message";
import { SuccessResponseDto } from "../../common/dtos/success-response.dto";
import { RegisterService } from "./register.service";
import { RegisterDto } from "./dtos/register.dto";

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@Controller(urlsConstant.ROUTE_PREFIX_REGISTER_ANALYTICS)
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
	status: HttpStatus.NOT_FOUND,
	description: errorResponseMessage.NOT_FOUND.EN,
	type: ErrorResponseDto,
})
export class RegisterController {
	constructor(private readonly registerService: RegisterService) { }

	@Get(urlsConstant.API_GET_ANALYTICS_REGISTER_SUMMARY)
	@ResponseSerializer(HttpStatus.OK, analyticsResponseMessage.GET_ANALYTICS_REGISTER_SUMMARY.EN)
	@ApiOperation({
		summary: "Get Analytics summary register",
		description: "Get Analytics summary register",
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: analyticsResponseMessage.GET_ANALYTICS_REGISTER_SUMMARY.EN,
		type: SuccessResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: analyticsResponseMessage.ANALYTICS_REGISTER_SUMMARY_NOT_FOUND.EN,
		type: ErrorResponseDto,
	})
	async getRegisterSummary(@Query() filter: RegisterDto) {
		return await this.registerService.getRegisterSummary(filter);
	}
}
