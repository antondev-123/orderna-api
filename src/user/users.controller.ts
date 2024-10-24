import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseArrayPipe,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FastifyRequest } from "fastify";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { consumers, errorResponseMessage, filterRepsonseMessage, swaggerConstant, urlsConstant, userResponseMessage } from "src/common/constants";
import { authResponseMessage } from "src/common/constants/response-messages/auth.response-message";
import { ResponseSerializer } from "src/common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "src/common/dtos/error-response.dto";
import { SuccessResponseDto } from "src/common/dtos/success-response.dto";
import { CreateUserDto } from "./dtos/create.user.dto";
import { FilterUserDto } from "./dtos/filter.user.dto";
import { UpdateUserDto } from "./dtos/update.user.dto";
import { UsersService } from "./users.service";
import { BaseMobileNumberDto } from "src/common/dtos/contact-numbers/base-mobile-number.dto";
import { BaseTelephoneNumberDto } from "src/common/dtos/contact-numbers/base-telephone-number.dto";

@UseGuards(AuthGuard)
@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
@Controller(urlsConstant.ROUTE_PREFIX_USER)
@ApiTags("Users")
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
export class UsersController {
	constructor(
		private usersService: UsersService,
	) {
	}

	//Get user by id API
	@Get(urlsConstant.API_GET_USER_ID)
	@ResponseSerializer(HttpStatus.OK, userResponseMessage.GET_USER_DETAILS)
	@ApiOperation({
		summary: "Get user by id",
	})
	@ApiParam({ name: 'userId', description: 'ID of the user to be fetched', type: 'number' })
	@ApiResponse({ status: HttpStatus.OK, description: userResponseMessage.GET_USER_DETAILS.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: userResponseMessage.USER_NOT_FOUND.EN, type: ErrorResponseDto })
	async getUserById(
		@Param("userId") userId: number,
	): Promise<any> {
		try {
			// Note: successResponse is async, so we await it to ensure response is sent before continuing
			// If not awaited, response may not complete before function exits
			// Also, ensure to use the `return` keyword to properly return the response
			return await this.usersService.getUserByIdService(userId);
		} catch (error) {
			throw error;
		}
	}

	//Get user by email API
	@Get(urlsConstant.API_GET_USER_EMAIL)
	@ResponseSerializer(HttpStatus.OK, userResponseMessage.GET_USER_DETAILS)
	@ApiOperation({
		summary: "Get user by email",
	})
	@ApiResponse({ status: HttpStatus.OK, description: userResponseMessage.GET_USER_DETAILS.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: userResponseMessage.USER_NOT_FOUND.EN, type: ErrorResponseDto })
	async getUserByEmail(
		@Query("email") email: string,
	): Promise<any> {
		try {
			return await this.usersService.getUserByEmailService(email);
		} catch (error) {
			throw error;
		}
	}

	//Get all Users
	@Get()
	@ResponseSerializer(HttpStatus.OK, userResponseMessage.GET_USER_DETAILS)
	@ApiOperation({
		summary: "Get all users",
	})
	@ApiResponse({ status: HttpStatus.OK, description: userResponseMessage.GET_USER_DETAILS.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: filterRepsonseMessage.PERIOD_NOT_FOUND.EN, type: ErrorResponseDto })
	async getUsers(
		@Query() filters: FilterUserDto,
	): Promise<any> {
		try {
			return await this.usersService.getUsersService(filters);
		} catch (error) {
			throw error;
		}
	}

	@Post()
	@ResponseSerializer(HttpStatus.CREATED, userResponseMessage.ADD_USER)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({
		summary: "Create a new user",
	})
	@ApiResponse({ status: HttpStatus.CREATED, description: userResponseMessage.ADD_USER.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.CONFLICT, description: userResponseMessage.CONFLICT_USER.EN, type: ErrorResponseDto })
	async addUser(
		@Req() request: FastifyRequest,
		@Body() userData: CreateUserDto): Promise<any> {
		try {
			const tokenData = request["user"];
			return await this.usersService.addUser(userData, tokenData);
		} catch (error) {
			throw error;
		}
	}

	//Update user by Id
	@Patch(urlsConstant.API_UPDATE_USER)
	@ResponseSerializer(HttpStatus.OK, userResponseMessage.UPDATE_USER)
	@ApiOperation({
		summary: "Update user by id",
	})
	@ApiParam({ name: 'userId', description: 'ID of the user to be updated', type: 'number' })
	@ApiResponse({ status: HttpStatus.OK, description: userResponseMessage.ADD_USER.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.FORBIDDEN, description: authResponseMessage.FORBIDDEN_USER_ROLE.EN, type: ErrorResponseDto })
	async updateUser(
		@Req() request: FastifyRequest,
		@Param("userId", ParseIntPipe) userId: number,
		@Body() updateData: UpdateUserDto,
	): Promise<any> {
		try {
			const tokenData = request["user"];
			return await this.usersService.updateUserService(userId, updateData, tokenData);
		} catch (error) {
			throw error;
		}
	}

	// Soft Delete user by Id
	@Delete(urlsConstant.API_DELETE_USER)
	@ResponseSerializer(HttpStatus.OK, userResponseMessage.DELETE_USER)
	@ApiOperation({
		summary: "Delete user by id",
	})
	@ApiParam({ name: 'userId', description: 'ID of the user to be deleted', type: 'number' })
	@ApiResponse({ status: HttpStatus.OK, description: userResponseMessage.DELETE_USER.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.FORBIDDEN, description: authResponseMessage.FORBIDDEN_USER_ROLE.EN, type: ErrorResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: userResponseMessage.USER_NOT_FOUND.EN, type: ErrorResponseDto })
	async deleteUser(
		@Req() request: FastifyRequest,
		@Param("userId", ParseIntPipe) userId: number,
	): Promise<any> {
		try {
			const tokenData = request["user"];
			return await this.usersService.deleteUserService(userId, tokenData);
		} catch (error) {
			throw error;
		}
	}

	// Soft Delete multiple users by id
	//TODO: convert to post & DTO
	//urlsConstant.API_DELETE_USERS
	@Delete()
	@ResponseSerializer(HttpStatus.OK, userResponseMessage.DELETE_USER)
	@ApiOperation({
		description: "Delete multiple users by id",
	})
	@ApiResponse({ status: HttpStatus.OK, description: userResponseMessage.DELETE_USER.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.FORBIDDEN, description: authResponseMessage.FORBIDDEN_USER_ROLE.EN, type: ErrorResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: userResponseMessage.USER_NOT_FOUND.EN, type: ErrorResponseDto })
	async deleteUsers(
		@Req() request: FastifyRequest,
		@Query("ids", new ParseArrayPipe({ items: Number, separator: "," }))
		ids: number[],
	): Promise<any> {
		try {
			const tokenData = request["user"];
			return await this.usersService.deleteUsersByIdsService(
				ids,
				tokenData,
			);
		} catch (error) {
			throw error;
		}
	}
}
