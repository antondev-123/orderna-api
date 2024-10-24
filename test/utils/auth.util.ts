import { HttpStatus } from "@nestjs/common";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { errorResponseMessage, urlsConstant } from "src/common/constants";
import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { SigninUserDto, SignupUserDto } from "src/user/dtos/signup.user.dto";
import * as request from "supertest";

export class AuthUtil {
	private email = "azc.baltazar@arkconsult.com";
	private password = "$passwordHere$252810";
	private app: NestFastifyApplication;

	constructor(app: NestFastifyApplication) {
		this.app = app;
	}

	async signUp(): Promise<void> {
		const signupUserDto: SignupUserDto = {
			username: "testusername",
			password: this.password,
			firstName: "TestFirstname",
			lastName: "TestLastname",
			email: this.email,
			mobile: { countryCode: "+63", number: "9876543210" },
		};

		await request(this.app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_AUTH}${urlsConstant.API_SIGNUP_AUTH}`)
			.send(signupUserDto)
			.then(res => {
				if (res.statusCode === HttpStatus.CREATED) {
					const userId = res.body.data.id;
					expect(userId).toBeDefined();
				} else if (res.statusCode === HttpStatus.CONFLICT) {
					winstonLoggerConfig.debug(`User with username = ${signupUserDto.username} already exists, proceeding to login...`);
					expect(res.body.error).toContain(errorResponseMessage.CONFLICT.EN);
				} else {
					winstonLoggerConfig.debug(`Unexpected status code: ${res.statusCode} received: ${res.error}`);
				}
			})
			.catch(err => {
				winstonLoggerConfig.error(`Unexpected error: ${err.message}`);
			});
	}

	async login(): Promise<any> {
		const signinUserDto: SigninUserDto = {
			email: this.email,
			password: this.password,
		};

		const signinResponse = await request(this.app.getHttpServer())
			.post(`${urlsConstant.ROUTE_PREFIX_AUTH}${urlsConstant.API_LOGIN_AUTH}`)
			.send(signinUserDto)
			.expect(HttpStatus.CREATED);

		return signinResponse;
	}

	async getAuthToken(signinResponse: any): Promise<any> {
		const jwtToken = signinResponse.body.data.accessToken;
		return { Authorization: `Bearer ${jwtToken}` };
	}
}
