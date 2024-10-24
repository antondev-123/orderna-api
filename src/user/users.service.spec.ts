import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserRole } from "src/common/constants/enums/user-role.enum";
import { UserStatus } from "src/common/constants/enums/user-status.enum";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { AuthRedisService } from "src/redis/services/auth-redis.service";
import { Repository } from "typeorm";
import { UserEntity } from "./entities/user.entity";
import { UsersService } from "./users.service";

describe("UsersService", () => {
	let usersService: UsersService;
	let userRepository: Repository<UserEntity>;
	let contactInfoRepository: Repository<ContactInformationEntity>;
	let configService: ConfigService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(UserEntity),
					useValue: {
						findOne: jest.fn(),
						save: jest.fn(),
						findBy: jest.fn(),
						remove: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(ContactInformationEntity),
					useValue: {
						findOne: jest.fn(),
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
						getTokenFromRedis: jest.fn(),
					},
				},
			],
		}).compile();

		usersService = module.get<UsersService>(UsersService);
		userRepository = module.get<Repository<UserEntity>>(
			getRepositoryToken(UserEntity),
		);
		contactInfoRepository = module.get<Repository<ContactInformationEntity>>(
			getRepositoryToken(ContactInformationEntity),
		);
		configService = module.get<ConfigService>(ConfigService);
	});

	it("should be defined", () => {
		expect(usersService).toBeDefined();
	});

	describe("getUserByIdService", () => {
		it("should return user details if found", async () => {
			const userId = 1;
			const user = new UserEntity();
			user.id = userId;
			user.status = UserStatus.ACTIVE;
			const contactInfo = new ContactInformationEntity();
			user.contactInfo = contactInfo;

			(userRepository.findOne as jest.Mock).mockResolvedValue(user);

			const result = await usersService.getUserByIdService(userId);
			expect(result).toEqual(
				user,
			);
		});

		it("should return not found if user does not exist", async () => {
			const userId = 1;

			(userRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(usersService.getUserByIdService(userId))
				.rejects
				.toThrow(NotFoundException)
		});
	});

	describe("getUserByEmailService", () => {
		it("should return user details if found", async () => {
			const email = "test@example.com";
			const contactInfo = new ContactInformationEntity();
			contactInfo.email = email;
			const user = new UserEntity();
			user.id = 1;
			user.status = UserStatus.ACTIVE;
			user.contactInfo = contactInfo;

			(contactInfoRepository.findOne as jest.Mock).mockResolvedValue(
				contactInfo,
			);
			(userRepository.findOne as jest.Mock).mockResolvedValue(user);

			const result = await usersService.getUserByEmailService(email);
			expect(result).toEqual(
				user,
			);
		});

		it("should return not found if general info does not exist", async () => {
			const email = "test@example.com";

			(contactInfoRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(usersService.getUserByEmailService(email)).rejects.toThrow(NotFoundException);
		});

		it("should return not found if user does not exist", async () => {
			const email = "test@example.com";
			const contactInfo = new ContactInformationEntity();
			contactInfo.email = email;

			(contactInfoRepository.findOne as jest.Mock).mockResolvedValue(
				contactInfo,
			);
			(userRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(usersService.getUserByEmailService(email)).rejects.toThrow(NotFoundException);
		});
	});

	describe("updateUserService", () => {
		it("should update user details if admin", async () => {
			const userId = 1;
			const updateData = { firstName: "newFirstName" };
			const tokenData = { object: { role: UserRole.ADMIN } };
			const user = new UserEntity();
			user.id = userId;
			user.contactInfo = new ContactInformationEntity();

			(userRepository.findOne as jest.Mock).mockResolvedValue(user);
			(userRepository.save as jest.Mock).mockResolvedValue({
				...user,
				...updateData,
			});

			const result = await usersService.updateUserService(
				userId,
				updateData,
				tokenData,
			);
			expect(result).toEqual(
				{ ...user, ...updateData },
			);
		});

		it("should return forbidden if not admin", async () => {
			const userId = 1;
			const updateData = { firstName: "newFirstName" };
			const tokenData = { object: { role: UserRole.MANAGER } };

			await expect(usersService.updateUserService(userId, updateData, tokenData)).rejects.toThrow(ForbiddenException);
		});

		it("should return not found if user does not exist", async () => {
			const userId = 1;
			const updateData = { firstName: "newFirstName" };
			const tokenData = { object: { role: UserRole.ADMIN } };

			(userRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(usersService.updateUserService(userId, updateData, tokenData)).rejects.toThrow(NotFoundException);
		});
	});

	describe("deleteUserService", () => {
		it("should delete user if admin", async () => {
			const userId = 1;
			const tokenData = { object: { role: UserRole.ADMIN } };
			const user = new UserEntity();
			user.id = userId;
			user.contactInfo = new ContactInformationEntity();
			user.status = UserStatus.ACTIVE;

			(userRepository.findOne as jest.Mock).mockResolvedValue(user);
			(userRepository.remove as jest.Mock).mockResolvedValue({
				...user,
			});

			const result = await usersService.deleteUserService(userId, tokenData);
			expect(result).toEqual({ ...user });
		});

		it("should return forbidden if not admin", async () => {
			const userId = 1;
			const tokenData = { object: { role: UserRole.MANAGER } };

			await expect(usersService.deleteUserService(userId, tokenData)).rejects.toThrow(ForbiddenException);
		});

		it("should return not found if user does not exist", async () => {
			const userId = 1;
			const tokenData = { object: { role: UserRole.ADMIN } };

			(userRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(usersService.deleteUserService(userId, tokenData)).rejects.toThrow(NotFoundException);
		});
	});

	describe("getUserByEmailService", () => {
		it("should return user details if found", async () => {
			const email = "test@example.com";
			const contactInfo = new ContactInformationEntity();
			contactInfo.email = email;
			const user = new UserEntity();
			user.id = 1;
			user.status = UserStatus.ACTIVE;
			user.contactInfo = contactInfo;

			(contactInfoRepository.findOne as jest.Mock).mockResolvedValue(
				contactInfo,
			);
			(userRepository.findOne as jest.Mock).mockResolvedValue(user);

			const result = await usersService.getUserByEmailService(email);
			expect(result).toEqual(
				user
			);
		});

		it("should return not found if general info does not exist", async () => {
			const email = "test@example.com";

			(contactInfoRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(usersService.getUserByEmailService(email)).rejects.toThrow(NotFoundException);
		});

		it("should return not found if user does not exist", async () => {
			const email = "test@example.com";
			const contactInfo = new ContactInformationEntity();
			contactInfo.email = email;

			(contactInfoRepository.findOne as jest.Mock).mockResolvedValue(
				contactInfo,
			);
			(userRepository.findOne as jest.Mock).mockResolvedValue(null);

			await expect(usersService.getUserByEmailService(email)).rejects.toThrow(NotFoundException);
		});
	});
});