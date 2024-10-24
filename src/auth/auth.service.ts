import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as jwt from "jsonwebtoken";
import { UserStatus } from "src/common/constants/enums/user-status.enum";
import { errorResponseMessage, userResponseMessage } from "src/common/constants/response-messages";
import { authResponseMessage } from "src/common/constants/response-messages/auth.response-message";
import { Generator } from "src/common/utils/generator.util";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { AuthRedisService } from "src/redis/services/auth-redis.service";
import { SigninUserDto, SignupUserDto } from "src/user/dtos/signup.user.dto";
import { UserEntity } from "src/user/entities/user.entity";
import { TokenService } from "src/user/utils/commonServices/jwtToken.service";
import {
	PasswordService,
} from "src/user/utils/commonServices/password.service";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
	constructor(
		private readonly passwordService: PasswordService,
		private readonly tokenService: TokenService,
		private readonly authRedisService: AuthRedisService,

		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(ContactInformationEntity)
		private contactInfoRepository: Repository<ContactInformationEntity>,
	) { }

	async getUserByTokenService(id: number): Promise<any> {
		try {
			const user = await this.userRepository.findOne({
				where: { id: id, status: UserStatus.ACTIVE },
				relations: { contactInfo: true },
			});

			if (!user) {
				throw new NotFoundException(
					userResponseMessage.USER_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}
			return user;
		} catch (error) {
			throw error;
		}
	}

	async signupUserService(signupUserDto: SignupUserDto): Promise<any> {
		try {
			const existingContactInfo = await this.contactInfoRepository
				.createQueryBuilder("contactInfo")
				.where("contactInfo.email = :email OR (contactInfo.mobileCountrycode = :countryCode AND contactInfo.mobileNumber = :mobileNumber)", {
					email: signupUserDto.email,
					countryCode: signupUserDto.mobile?.countryCode,
					mobileNumber: signupUserDto.mobile?.number,
				})
				.getOne();

			if (existingContactInfo) {
				const conflictField =
					existingContactInfo.email === signupUserDto.email ? "email" : "mobile";
				const conflictValue =
					existingContactInfo.email === signupUserDto.email ? signupUserDto.email : signupUserDto.mobile.countryCode + signupUserDto.mobile.number;

				throw new ConflictException(
					`User with ${conflictField} ${conflictValue} already exists`,
					errorResponseMessage.CONFLICT.EN
				);
			}

			const existingUserName = await this.userRepository.findOneBy({
				username: signupUserDto.username,
			});

			if (existingUserName) {
				throw new ConflictException(
					`User with ${signupUserDto.username} already exists`,
					errorResponseMessage.CONFLICT.EN
				);
			}

			const username =
				signupUserDto.username ??
				`${signupUserDto.firstName.charAt(0)}${signupUserDto.lastName
					}`.toLowerCase();

			let password =
				signupUserDto.password ?? Generator.generatePassword(10);

			password = await this.passwordService.hashPassword(password);

			const contactInfo = this.contactInfoRepository.create();
			contactInfo.firstName = signupUserDto.firstName;
			contactInfo.lastName = signupUserDto.lastName;
			contactInfo.email = signupUserDto.email;
			contactInfo.mobile = signupUserDto.mobile;

			const user = this.userRepository.create();
			user.username = username;
			user.password = password;
			user.contactInfo = contactInfo;

			const userData = await this.userRepository.save(user);
			return userData;
		} catch (error) {
			throw error;
		}
	}

	async signinUserService(signinUserDto: SigninUserDto): Promise<any> {
		try {
			const contactInfo = await this.contactInfoRepository.findOne({
				where: { email: signinUserDto.email },
			});
			if (!contactInfo) {
				throw new UnauthorizedException(
					authResponseMessage.INVALID_USER_CREDENTIALS.EN,
					errorResponseMessage.UNAUTHORIZED.EN
				);
			}

			const userData = await this.userRepository.findOne({
				where: { id: contactInfo.id },
				relations: { contactInfo: true },
			});

			if (!userData) {
				throw new UnauthorizedException(
					authResponseMessage.INVALID_USER_CREDENTIALS.EN,
					errorResponseMessage.UNAUTHORIZED.EN
				);
			} else if (userData.status !== UserStatus.ACTIVE) {
				throw new UnauthorizedException(
					`Your account is ${userData.status} and not authorized for this action. Please contact your manager.`,
					errorResponseMessage.UNAUTHORIZED.EN
				);
			} else {
				const checkPassword = await this.passwordService.comparePassword(
					signinUserDto.password,
					userData.password,
				);
				if (checkPassword) {
					delete userData.password;
					const tokenPayload = {
						...userData,
					};
					const accessToken =
						this.tokenService.generateAccessToken(tokenPayload);
					const refreshToken =
						this.tokenService.generateRefreshToken(tokenPayload);
					const redisObj = {
						accessToken: accessToken,
						refreshToken: refreshToken,
					};
					const expiresInSeconds = 3600;

					await this.authRedisService.saveTokenToRedis(userData.id, redisObj, expiresInSeconds);

					const now = new Date();
					const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);
					const loginData = {
						accessToken,
						refreshToken,
						expires_at: expiresAt,
					};

					return loginData;
				} else {
					throw new UnauthorizedException(
						authResponseMessage.INVALID_USER_CREDENTIALS.EN,
						errorResponseMessage.UNAUTHORIZED.EN
					);
				}
			}
		} catch (error) {
			throw error;
		}
	}

	async generateNewTokenService(token: string): Promise<any> {
		try {
			if (!token) {
				throw new UnauthorizedException(
					authResponseMessage.TOKEN_NOT_FOUND.EN,
					errorResponseMessage.UNAUTHORIZED.EN
				);
			}
			const decodedToken = jwt.decode(token);
			const tokenData = (decodedToken as jwt.JwtPayload).object;
			const tokenFromRedis = await this.authRedisService.getTokenFromRedis(tokenData.id);

			if (!tokenFromRedis) {
				throw new UnauthorizedException(
					authResponseMessage.UNAUTHORIZED_USER.EN,
					errorResponseMessage.UNAUTHORIZED.EN
				);
			}
			const parsedToken = JSON.parse(tokenFromRedis);

			if (parsedToken.refreshToken !== token) {
				throw new UnauthorizedException(
					authResponseMessage.UNAUTHORIZED_USER.EN,
					errorResponseMessage.UNAUTHORIZED.EN
				);
			} else {
				const accessToken = this.tokenService.generateAccessToken(
					tokenData,
				);
				const refreshToken = this.tokenService.generateRefreshToken(
					tokenData,
				);
				const redisObj = {
					accessToken: accessToken,
					refreshToken: refreshToken,
				};
				this.authRedisService.saveTokenToRedis(tokenData.id, redisObj, 3600);

				const data = { accessToken, refreshToken };
				return data;
			}
		} catch (error) {
			throw error;
		}
	}

	async logoutUserService(tokenData: any): Promise<any> {
		try {
			await this.authRedisService.deleteTokenFromRedis(tokenData.object.id);
			return {};
		} catch (error) {
			throw error;
		}
	}
}
