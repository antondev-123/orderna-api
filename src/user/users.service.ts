import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { errorResponseMessage, filterRepsonseMessage, userResponseMessage } from "src/common/constants/";
import { FilterPeriod } from "src/common/constants/enums/filter-period.enum";
import { UserRole } from "src/common/constants/enums/user-role.enum";
import { UserStatus } from "src/common/constants/enums/user-status.enum";
import { getEntityColumns } from "src/common/utils/entity.util";
import { Generator } from "src/common/utils/generator.util";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { AuthRedisService } from "src/redis/services/auth-redis.service";
import { In, Repository } from "typeorm";
import { CreateUserDto } from "./dtos/create.user.dto";
import { FilterUserDto } from "./dtos/filter.user.dto";
import { UserEntity } from "./entities/user.entity";
import { UpdateUserDto } from "./dtos/update.user.dto";

@Injectable()
export class UsersService {
	constructor(
		private readonly authRedisService: AuthRedisService,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(ContactInformationEntity)
		private contactInfoRepository: Repository<ContactInformationEntity>,
		private readonly configService: ConfigService,
	) { }
	async getUserByIdService(id: number): Promise<any> {
		try {
			const user = await this.userRepository.findOne({
				where: { id: id, status: UserStatus.ACTIVE },
				relations: { contactInfo: true },
			});

			if (!user) {
				// It's important to use the `throw` keyword to propagate errors properly in asynchronous operations.
				// If an error occurs within a try block and you don't `throw` it, the catch block won't capture it as an error,
				// potentially leading to unexpected behavior in error handling.

				throw new NotFoundException(
					userResponseMessage.USER_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}
			return user;
		} catch (error) {
			throw error;
		}
	}

	async getUserByEmailService(email: string): Promise<any> {
		try {
			const genInfo = await this.contactInfoRepository.findOne({
				where: { email: email },
			});

			if (!genInfo) {
				throw new NotFoundException(
					userResponseMessage.USER_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}

			const user = await this.userRepository.findOne({
				where: { id: genInfo.id, status: UserStatus.ACTIVE },
				relations: { contactInfo: true },
			});
			if (!user) {
				throw new NotFoundException(
					userResponseMessage.USER_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN,
				);
			} else
				return user;
		} catch (error) {
			throw error;
		}
	}

	async getUsersService(filters: FilterUserDto): Promise<any> {
		try {
			const query = this.userRepository
				.createQueryBuilder("user")
				.leftJoinAndSelect("user.contactInfo", "contactInfo");

			if (filters.username) {
				query.andWhere("user.username = :username", {
					username: filters.username,
				});
			}

			if (filters.email) {
				query.andWhere("contactInfo.email = :email", { email: filters.email });
			}

			if (filters.period) {
				const date = new Date();
				switch (filters.period) {
					case FilterPeriod.TODAY:
						query.andWhere("user.createdAt >= :startDate", {
							startDate: new Date(date.setHours(0, 0, 0, 0)),
						});
						break;
					case FilterPeriod.LAST_7_DAYS:
						query.andWhere("user.createdAt >= :startDate", {
							startDate: new Date(date.setDate(date.getDate() - 7)),
						});
						break;
					case FilterPeriod.LAST_4_WEEKS:
						query.andWhere("user.createdAt >= :startDate", {
							startDate: new Date(date.setDate(date.getDate() - 28)),
						});
						break;
					case FilterPeriod.LAST_12_MONTHS:
						query.andWhere("user.createdAt >= :startDate", {
							startDate: new Date(date.setMonth(date.getMonth() - 12)),
						});
						break;
					case FilterPeriod.MAX:
						break;
					default:
						throw new NotFoundException(
							filterRepsonseMessage.PERIOD_NOT_FOUND.EN,
							errorResponseMessage.NOT_FOUND.EN,
						);
				}
			}

			if (filters.status) {
				query.andWhere("user.status = :status", { status: filters.status });
			}

			if (filters.role) {
				query.andWhere("user.role = :role", { role: filters.role });
			}

			if (filters.sortBy) {
				const entityColumns = getEntityColumns([UserEntity, ContactInformationEntity]);
				const sortOrder = filters.sortOrder === "DESC" ? "DESC" : "ASC";
				if (entityColumns.includes(filters.sortBy)) {
					query.orderBy(`user.${filters.sortBy} = :sortBy`, sortOrder);
					query.setParameter("sortBy", filters.sortBy);
				}
			}

			if (filters.limit) {
				query.limit(filters.limit);
			}
			const userData = await query.getMany();
			return userData;
		} catch (error) {
			throw error;
		}
	}

	async addUser(
		createUserData: CreateUserDto,
		tokenData: any,
	): Promise<any> {
		try {
			let username: string;
			const existingUser = await this.contactInfoRepository
				.createQueryBuilder("user")
				.where("user.email = :email OR user.mobileNumber = :mobileNumber", {
					email: createUserData.email,
					mobileNumber: createUserData.mobile.number,
				})
				.getOne();

			if (existingUser) {
				const conflictField =
					existingUser.email === createUserData.email ? "email" : "mobile";
				throw new ConflictException(
					`User with ${conflictField} ${createUserData[conflictField]} already exists`,
					errorResponseMessage.CONFLICT.EN,
				);
			}
			if (tokenData.object.role !== UserRole.ADMIN) {
				username = createUserData.username;
			} else {
				username = new String(
					`${createUserData.firstName.charAt(0)}${createUserData.lastName}`,
				)!.toLowerCase();
			}
			const password = createUserData.password ?? Generator.generatePassword(10);

			const user = this.userRepository.create({
				...createUserData,
				username: username,
				password: password,
				contactInfo: {
					firstName: createUserData.firstName,
					lastName: createUserData.lastName,
					email: createUserData.email,
					mobile: createUserData.mobile,
					telephone: createUserData.telephone,
				},
			});

			const userData = await this.userRepository.save(user);

			return userData;
		} catch (error) {
			throw error;
		}
	}

	async updateUserService(
		userId: number,
		updateData: UpdateUserDto,
		tokenData: any,
	): Promise<any> {
		try {
			if (tokenData.object.role !== UserRole.ADMIN) {
				throw new ForbiddenException(
					`User with role ${tokenData.object.role} lacks the required permissions.`,
					errorResponseMessage.FORBIDDEN.EN,
				);
			}
			const user = await this.userRepository.findOne({
				where: { id: userId },
				relations: { contactInfo: true },
			});
			if (!user) {
				throw new NotFoundException(
					userResponseMessage.USER_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}

			const userData = await this.userRepository.save({
				...updateData,
				contactInfo: {
					firstName: updateData.firstName,
					lastName: updateData.lastName,
					email: updateData.email,
					mobile: updateData.mobile,
					telephone: updateData.telephone,
				}
			});
			return userData;
		} catch (error) {
			throw error;
		}
	}

	async deleteUserService(userId: number, tokenData: any): Promise<any> {
		try {
			const role: any = tokenData.object.role.trim();
			if (role !== UserRole.ADMIN) {
				throw new ForbiddenException(
					`User with role ${role} lacks the required permissions.`,
					errorResponseMessage.FORBIDDEN.EN,
				);
			}
			const user = await this.userRepository.findOne({
				where: { id: userId },
				relations: { contactInfo: true },
			});
			if (!user) {
				throw new NotFoundException(
					userResponseMessage.USER_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}
			//TODO: add back for soft delete
			// Object.assign(user, { status: UserStatus.INACTIVE });
			const userData = await this.userRepository.remove(user);
			return userData;
		} catch (error) {
			throw error;
		}
	}

	async deleteUsersByIdsService(ids: number[], tokenData: any): Promise<any> {
		try {
			const role: any = tokenData.object.role.trim();
			if (role !== UserRole.ADMIN) {
				throw new ForbiddenException(
					`User with role ${role} lacks the required permissions.`,
					errorResponseMessage.FORBIDDEN.EN,
				);
			}
			// const users = await this.userRepository.findBy({ id: In(ids) });
			const users = await this.userRepository.find({ where: { id: In(ids) }, relations: { contactInfo: true } });
			if (users.length === 0) {
				throw new NotFoundException(
					userResponseMessage.USER_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}
			//TODO: add back for soft delete
			// users.forEach(user => {
			// 	user.status = UserStatus.INACTIVE;
			// });

			const userData = await this.userRepository.remove(users);
			return userData;
		} catch (error) {
			throw error;
		}
	}
}