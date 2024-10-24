import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Post,
	Req,
	Res,
	UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FastifyReply, FastifyRequest } from "fastify";
import { consumers, errorResponseMessage, swaggerConstant, urlsConstant, userResponseMessage } from "src/common/constants";
import { authResponseMessage } from "src/common/constants/response-messages/auth.response-message";
import { ResponseSerializer } from "src/common/decorators/responseSerializer.decorator";
import { ErrorResponseDto } from "src/common/dtos/error-response.dto";
import { SuccessResponseDto } from "src/common/dtos/success-response.dto";
import { SigninUserDto, SignupUserDto } from "src/user/dtos/signup.user.dto";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";

@Controller(urlsConstant.ROUTE_PREFIX_AUTH)
@ApiTags("Auth")
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
export class AuthController {
	constructor(
		private authService: AuthService,
	) { }

	@Get(urlsConstant.API_WHOAMI_AUTH)
	@UseGuards(AuthGuard)
	@ResponseSerializer(HttpStatus.OK, userResponseMessage.GET_USER_DETAILS)
	@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
	@ApiOperation({
		summary: "Get user by token",
	})
	@ApiResponse({ status: HttpStatus.OK, description: userResponseMessage.GET_USER_DETAILS.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.NOT_FOUND, description: userResponseMessage.USER_NOT_FOUND.EN, type: ErrorResponseDto })
	async getuserByToken(
		@Req() request: FastifyRequest,
		@Res() res: FastifyReply,
	): Promise<any> {
		try {
			const user = request["user"];
			return await this.authService.getUserByTokenService(user.object.userId);
		} catch (error) {
			throw error;
		}
	}

	//Signup API
	@Post(urlsConstant.API_SIGNUP_AUTH)
	@ResponseSerializer(HttpStatus.CREATED, userResponseMessage.ADD_USER)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({
		summary: "Register a new user",
	})
	@ApiBody({
		description: "Register a new user",
		type: SignupUserDto,
	})
	@ApiResponse({ status: HttpStatus.CREATED, description: authResponseMessage.SIGN_UP.EN, type: SuccessResponseDto })
	@ApiResponse({ status: HttpStatus.CONFLICT, description: authResponseMessage.CONFLICT_ENTRIES_FOR_EMAIL_OR_PHONE.EN, type: ErrorResponseDto })
	async signupUser(
		@Body() signupUserDto: SignupUserDto,
	): Promise<any> {
		try {
			return await this.authService.signupUserService(signupUserDto);
		} catch (error) {
			throw error;
		}
	}

	//User login
	@Post(urlsConstant.API_LOGIN_AUTH)
	@ResponseSerializer(HttpStatus.CREATED, authResponseMessage.SIGN_IN)
	@ApiConsumes(consumers.FORM_URL_ENCODED, consumers.JSON)
	@ApiOperation({
		summary: "Signin a User",
	})
	@ApiBody({
		description: "Signin a user",
		type: SigninUserDto,
	})
	@ApiResponse({ status: HttpStatus.CREATED, description: authResponseMessage.SIGN_IN.EN, type: SuccessResponseDto })
	async signinUser(
		@Body() signinUserDto: SigninUserDto,
	): Promise<any> {
		try {
			return await this.authService.signinUserService(signinUserDto);
		} catch (error) {
			throw error;
		}
	}

	@Post(urlsConstant.API_TOKEN_AUTH)
	@ResponseSerializer(HttpStatus.OK, authResponseMessage.GENERATE_TOKEN)
	@ApiOperation({
		summary: "Generate new tokens using refresh token",
	})
	@ApiResponse({ status: HttpStatus.CREATED, description: authResponseMessage.GENERATE_TOKEN.EN, type: SuccessResponseDto })
	async generateNewToken(
		@Req() request: FastifyRequest,
	): Promise<any> {
		try {
			const authorization = request.headers["authorization"];
			const token = authorization?.replace("Bearer ", "");
			return await this.authService.generateNewTokenService(token);
		} catch (error) {
			throw error;
		}
	}

	//Logout user API
	@Get(urlsConstant.API_LOGOUT_AUTH)
	@UseGuards(AuthGuard)
	@ResponseSerializer(HttpStatus.OK, authResponseMessage.LOG_OUT)
	@ApiBearerAuth(swaggerConstant.AUTHORIZATION)
	@ApiOperation({
		summary: "Logout user",
	})
	@ApiResponse({ status: HttpStatus.OK, description: authResponseMessage.SIGN_IN.EN, type: SuccessResponseDto })
	async logoutUser(
		@Req() request: FastifyRequest,
	): Promise<any> {
		try {
			const tokenData = request["user"];
			return await this.authService.logoutUserService(tokenData);
		} catch (error) {
			throw error;
		}
	}
}

