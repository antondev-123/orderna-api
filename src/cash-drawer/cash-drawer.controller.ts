import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	Req,
	UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FastifyRequest } from "fastify";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { cashRegisterResponseMessage, errorResponseMessage } from "src/common/constants";
import { consumers, swaggerConstant } from "src/common/constants/swagger.constant";
import { urlsConstant } from "src/common/constants/url.constant";
import { ResponseSerializer } from "src/common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "src/common/dtos/error-response.dto";
import { SuccessResponseDto } from "src/common/dtos/success-response.dto";
import { CashDrawerService } from "./cash-drawer.service";
import { AddCashManagementDto } from "./dtos/add-cash-management.dto";
import { CloseRegisterDto } from "./dtos/close-register.dto";
import { EditCashManagementDto } from "./dtos/edit-cash-management.dto";
import { GetRegisterSummaryDto } from "./dtos/get-register-summary.dto";
import { OpenRegisterDto } from "./dtos/open-register.dto";

@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@UseGuards(AuthGuard)
@Controller(urlsConstant.ROUTE_PREFIX_CASH_DRAWER)
@ApiTags("Cash Drawers")
@ApiResponse({
	status: HttpStatus.INTERNAL_SERVER_ERROR,
	description: errorResponseMessage.INTERNAL_SERVER_ERROR.EN,
	type: ErrorResponseDto
})
@ApiResponse({
	status: HttpStatus.UNPROCESSABLE_ENTITY,
	description: errorResponseMessage.UNPROCESSABLE_ENTITY.EN,
	type: ErrorResponseDto
})
@ApiResponse({
	status: HttpStatus.UNAUTHORIZED,
	description: errorResponseMessage.UNAUTHORIZED.EN,
	type: ErrorResponseDto
})
@ApiResponse({
	status: HttpStatus.BAD_REQUEST,
	description: errorResponseMessage.BAD_REQUEST.EN,
	type: ErrorResponseDto
})
export class CashDrawerController {
	constructor(
		private readonly cashDrawerService: CashDrawerService,
	) { }

	@Post()
	@ResponseSerializer(HttpStatus.CREATED, cashRegisterResponseMessage.ADD_REGISTER_DETAILS)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Open a cash register' })
	@ApiResponse({ status: HttpStatus.CREATED, description: cashRegisterResponseMessage.OPEN_REGISTER.EN, type: SuccessResponseDto })
	async openRegister(
		@Req() req: FastifyRequest,
		@Body() openRegisterDto: OpenRegisterDto,
	) {
		try {
			const tokenData = req["user"];
			return await this.cashDrawerService.openRegister(openRegisterDto, tokenData);
		} catch (error) {
			throw error;
		}
	}

	@Get()
	@ResponseSerializer(HttpStatus.OK, cashRegisterResponseMessage.GET_REGISTER_LIST)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({ summary: 'Get a summary of all cash registers' })
	@ApiResponse({ status: HttpStatus.OK, description: cashRegisterResponseMessage.GET_REGISTER_LIST.EN, type: SuccessResponseDto })
	async getRegisterSummary(
		@Query() getRegisterSummaryDto: GetRegisterSummaryDto,
	) {
		try {
			return await this.cashDrawerService.getRegisterSummary(getRegisterSummaryDto);
		} catch (error) {
			throw error;
		}
	}

	@Put(urlsConstant.API_UPDATE_REGISTER)
	@ResponseSerializer(HttpStatus.OK, cashRegisterResponseMessage.UPDATE_CASH_REGISTER)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiParam({ name: 'registerId', description: 'ID of the cash register', type: 'number' })
	@ApiOperation({ summary: 'Close a cash register' })
	@ApiResponse({ status: HttpStatus.OK, description: cashRegisterResponseMessage.CLOSE_REGISTER.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: cashRegisterResponseMessage.CASH_REGISTER_NOT_FOUND.EN, type: SuccessResponseDto })
	async closeRegister(
		@Param("registerId", new ParseIntPipe()) registerId: number,
		@Body() closeRegisterDto: CloseRegisterDto,
	) {
		try {
			return await this.cashDrawerService.closeRegister(registerId, closeRegisterDto);
		} catch (error) {
			throw error;
		}
	}

	@Get(urlsConstant.API_GET_REGISTER)
	@ResponseSerializer(HttpStatus.OK, cashRegisterResponseMessage.GET_REGISTER_DETAILS)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiParam({ name: 'registerId', description: 'ID of the cash register', type: 'number' })
	@ApiOperation({ summary: 'Get details of a specific cash register' })
	@ApiResponse({ status: HttpStatus.OK, description: cashRegisterResponseMessage.GET_REGISTER_DETAILS.EN, type: SuccessResponseDto })
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: cashRegisterResponseMessage.CASH_REGISTER_NOT_FOUND.EN,
		type: ErrorResponseDto
	})
	async getRegisterSummaryDetails(
		@Param("registerId", new ParseIntPipe()) registerId: number,
	) {
		try {
			return await this.cashDrawerService.getRegisterSummaryDetails(registerId);
		} catch (error) {
			throw error;
		}
	}

	@Post(urlsConstant.API_ADD_CASH_MANAGEMENT)
	@ResponseSerializer(HttpStatus.CREATED, cashRegisterResponseMessage.ADD_CASH)
	@ApiConsumes(consumers.JSON)
	@ApiParam({ name: 'registerId', description: 'ID of the cash register', type: 'number' })
	@ApiOperation({ summary: 'Add or deduct cash from register' })
	@ApiResponse({ status: HttpStatus.CREATED, description: cashRegisterResponseMessage.ADD_CASH.EN, type: SuccessResponseDto })
	async addCashManagement(
		@Param("registerId", new ParseIntPipe()) registerId: number,
		@Body() addCashManagementDto: AddCashManagementDto,
	) {
		try {
			return await this.cashDrawerService.addCashManagement(addCashManagementDto, registerId);
		} catch (error) {
			throw error;
		}
	}

	@Put(urlsConstant.API_EDIT_CASH_MANAGEMENT)
	@ResponseSerializer(HttpStatus.OK, cashRegisterResponseMessage.UPDATED_CASH)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiParam({ name: 'registerId', description: 'ID of the cash register', type: 'number' })
	@ApiParam({ name: 'cashManagementId', description: 'ID of the cash to be edited', type: 'number' })
	@ApiOperation({ summary: 'Edit cash management details of a register' })
	@ApiResponse({ status: HttpStatus.CREATED, description: cashRegisterResponseMessage.UPDATED_CASH.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: cashRegisterResponseMessage.CASH_NOT_FOUND.EN, type: SuccessResponseDto })
	async editCashManagement(
		@Param("registerId", new ParseIntPipe()) registerId: number,
		@Param("cashManagementId", new ParseIntPipe()) cashManagementId: number,
		@Body() editCashManagementDto: EditCashManagementDto,
	) {
		try {
			return await this.cashDrawerService.editCashManagement(
				registerId,
				cashManagementId,
				editCashManagementDto,
			);
		} catch (error) {
			throw error;
		}
	}
}
