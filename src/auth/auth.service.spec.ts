import { ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as jwt from "jsonwebtoken";
import { UserStatus } from "src/common/constants/enums/user-status.enum";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { AuthRedisService } from "src/redis/services/auth-redis.service";
import { SigninUserDto, SignupUserDto } from "src/user/dtos/signup.user.dto";
import { UserEntity } from "src/user/entities/user.entity";
import { TokenService } from "src/user/utils/commonServices/jwtToken.service";
import { PasswordService } from "src/user/utils/commonServices/password.service";
import { Repository } from "typeorm";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
	let authService: AuthService;
	let authRedisService: AuthRedisService;
	let userRepository: Repository<UserEntity>;
	let contactInfoRepository: Repository<ContactInformationEntity>;
	let passwordService: PasswordService;
	let tokenService: TokenService;
	let configService: ConfigService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				PasswordService,
				TokenService,
				ConfigService,
				{
					provide: getRepositoryToken(UserEntity),
					useValue: {
						create: jest.fn(),
						findOne: jest.fn(),
						save: jest.fn(),
						findOneBy: jest.fn(),
						createQueryBuilder: jest.fn().mockReturnValue({
							where: jest.fn().mockReturnThis(),
							getOne: jest.fn(),
						}),
					},
				},
				{
					provide: getRepositoryToken(ContactInformationEntity),
					useValue: {
						create: jest.fn(),
						findOne: jest.fn(),
						createQueryBuilder: jest.fn().mockReturnValue({
							where: jest.fn().mockReturnThis(),
							getOne: jest.fn(),
						}),
					},
				},
				{
					provide: PasswordService,
					useValue: {
						hashPassword: jest.fn(),
						comparePassword: jest.fn(),
					},
				},
				{
					provide: TokenService,
					useValue: {
						generateAccessToken: jest.fn(),
						generateRefreshToken: jest.fn(),
					},
				},
				{
					provide: ConfigService,
					useValue: {
						get: jest.fn(),
					},
				},
				{
					provide: AuthRedisService,
					useValue: {
						saveTokenToRedis: jest.fn(),
						getTokenFromRedis: jest.fn(),
						deleteTokenFromRedis: jest.fn(),
					},
				},
			],
		}).compile();

		authService = module.get<AuthService>(AuthService);
		userRepository = module.get<Repository<UserEntity>>(
			getRepositoryToken(UserEntity),
		);
		contactInfoRepository = module.get<Repository<ContactInformationEntity>>(
			getRepositoryToken(ContactInformationEntity),
		);
		passwordService = module.get<PasswordService>(PasswordService);
		tokenService = module.get<TokenService>(TokenService);
		configService = module.get<ConfigService>(ConfigService);
		authRedisService = module.get<AuthRedisService>(AuthRedisService);
	});

	it("should be defined", () => {
		expect(authService).toBeDefined();
	});

	describe("signupUserService", () => {
		it("should sign up a new user successfully", async () => {
			const signupUserDto: SignupUserDto = {
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				mobile: { countryCode: "+63", number: "9876543210" },
				username: "johndoe",
				password: "password123",
			};

			const contactInfo = new ContactInformationEntity();
			contactInfo.firstName = signupUserDto.firstName;
			contactInfo.lastName = signupUserDto.lastName;
			contactInfo.email = signupUserDto.email;
			contactInfo.mobile = signupUserDto.mobile;

			const user = new UserEntity();
			user.username = signupUserDto.username;
			user.password = signupUserDto.password;
			user.contactInfo = contactInfo;

			jest
				.spyOn(contactInfoRepository, "create")
				.mockReturnValue(contactInfo);
			jest
				.spyOn(userRepository, "create")
				.mockReturnValue(user);
			jest.spyOn(contactInfoRepository, "createQueryBuilder").mockReturnValue({
				where: jest.fn().mockReturnThis(),
				getOne: jest.fn().mockResolvedValue(null),
			} as any);
			jest.spyOn(userRepository, "findOneBy").mockResolvedValue(null);
			jest
				.spyOn(passwordService, "hashPassword")
				.mockResolvedValue("hashedPassword");
			jest.spyOn(userRepository, "save").mockResolvedValue(user);

			const result = await authService.signupUserService(signupUserDto);

			expect(result).toEqual(user);
		});

		it("should return conflict if email already exists", async () => {
			const signupUserDto: SignupUserDto = {
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				mobile: { countryCode: "+63", number: "9876543210" },
				username: "johndoe",
				password: "password123",
			};

			const existingUser = new ContactInformationEntity();
			existingUser.email = signupUserDto.email;

			jest.spyOn(contactInfoRepository, "createQueryBuilder").mockReturnValue({
				where: jest.fn().mockReturnThis(),
				getOne: jest.fn().mockResolvedValue(existingUser),
			} as any);

			await expect(authService.signupUserService(signupUserDto)).rejects.toThrow(ConflictException);
		});

		it("should return conflict if user with mobile already exists", async () => {
			const signupUserDto: SignupUserDto = {
				firstName: "John",
				lastName: "Doe",
				email: "test@example.com",
				mobile: { countryCode: "+63", number: "9876543210" },
				username: "johndoe",
				password: "password123",
			};
			const existingUser = new ContactInformationEntity();
			existingUser.mobile = signupUserDto.mobile;

			(
				contactInfoRepository.createQueryBuilder().getOne as jest.Mock
			).mockResolvedValue(existingUser);

			await expect(authService.signupUserService(signupUserDto)).rejects.toThrow(ConflictException);
		});

		it("should return conflict if user with username already exists", async () => {
			const signupUserDto: SignupUserDto = {
				firstName: "John",
				lastName: "Doe",
				email: "test@example.com",
				mobile: { countryCode: "+63", number: "9876543210" },
				username: "johndoe",
				password: "password123",
			};

			const existingUser = new UserEntity();
			existingUser.username = signupUserDto.username;

			(
				contactInfoRepository.createQueryBuilder().getOne as jest.Mock
			).mockResolvedValue(null);
			(userRepository.findOneBy as jest.Mock).mockResolvedValue(
				existingUser
			);

			await expect(authService.signupUserService(signupUserDto)).rejects.toThrow(ConflictException);
		});
	});

	describe("signinUserService", () => {
		it("should sign in a user successfully", async () => {
			const signinUserDto: SigninUserDto = {
				email: "john.doe@example.com",
				password: "password123",
			};

			const contactInfo = new ContactInformationEntity();
			contactInfo.email = signinUserDto.email;

			const user = new UserEntity();
			user.id = 1;
			user.password = "hashedPassword";
			user.status = UserStatus.ACTIVE;
			user.contactInfo = contactInfo;

			jest
				.spyOn(contactInfoRepository, "findOne")
				.mockResolvedValue(contactInfo);
			jest.spyOn(userRepository, "findOne").mockResolvedValue(user);
			jest.spyOn(passwordService, "comparePassword").mockResolvedValue(true);
			jest
				.spyOn(tokenService, "generateAccessToken")
				.mockReturnValue("accessToken");
			jest
				.spyOn(tokenService, "generateRefreshToken")
				.mockReturnValue("refreshToken");
			jest.spyOn(configService, "get").mockReturnValue("secretKey");

			const result = await authService.signinUserService(signinUserDto);

			expect(result).toEqual(
				{
					accessToken: "accessToken",
					refreshToken: "refreshToken",
					expires_at: expect.any(Date),
				},
			);
		});

		it("should return bad request if credentials are invalid", async () => {
			const signinUserDto: SigninUserDto = {
				email: "john.doe@example.com",
				password: "password123",
			};

			jest.spyOn(contactInfoRepository, "findOne").mockResolvedValue(null);

			await expect(authService.signinUserService(signinUserDto))
				.rejects.toThrow(UnauthorizedException);
		});
		it("should return invalid credentials if password is incorrect", async () => {
			const signinUserDto: SigninUserDto = {
				email: "test@example.com",
				password: "password123",
			};
			const contactInfo = new ContactInformationEntity();
			contactInfo.email = signinUserDto.email;
			const user = new UserEntity();
			user.id = 1;
			user.status = UserStatus.ACTIVE;
			user.password = "hashedpassword";
			user.contactInfo = contactInfo;

			(contactInfoRepository.findOne as jest.Mock).mockResolvedValue(
				contactInfo,
			);
			(userRepository.findOne as jest.Mock).mockResolvedValue(user);
			(passwordService.comparePassword as jest.Mock).mockResolvedValue(false);

			await expect(authService.signinUserService(signinUserDto))
				.rejects.toThrow(UnauthorizedException);
		});
	});

	describe("generateNewTokenService", () => {
		it("should generate new tokens successfully", async () => {
			const token = "refreshToken";
			const decodedToken = {
				object: {
					id: 1,
				},
			};

			jest.spyOn(jwt, "decode").mockReturnValue(decodedToken);
			jest.spyOn(configService, "get").mockReturnValue("secretKey");
			jest.spyOn(authRedisService, "getTokenFromRedis").mockResolvedValue(
				JSON.stringify({
					accessToken: "oldAccessToken",
					refreshToken: token,
				}),
			);
			jest
				.spyOn(tokenService, "generateAccessToken")
				.mockReturnValue("newAccessToken");
			jest
				.spyOn(tokenService, "generateRefreshToken")
				.mockReturnValue("newRefreshToken");

			const result = await authService.generateNewTokenService(token);

			expect(result).toEqual(
				{
					accessToken: "newAccessToken",
					refreshToken: "newRefreshToken",
				},
			);
		});

		it("should return unauthorized if token is not provided", async () => {
			const token = "";

			await expect(authService.generateNewTokenService(token))
				.rejects.toThrow(UnauthorizedException);
		});
	});
	describe("getUserByTokenService", () => {
		it("should return user details if found", async () => {
			const userId = 1;
			const user = new UserEntity();
			user.id = userId;
			user.status = UserStatus.ACTIVE;
			const contactInfo = new ContactInformationEntity();
			user.contactInfo = contactInfo;

			(userRepository.findOne as jest.Mock).mockResolvedValue(user);

			const result = await authService.getUserByTokenService(userId);
			expect(result).toEqual(user);
		});

		it("should return not found if user does not exist", async () => {
			const userId = 1;

			(userRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(authService.getUserByTokenService(userId))
				.rejects.toThrow(NotFoundException)
		});
	});
});
