import { Injectable } from "@nestjs/common";
import { UserRole } from "src/common/constants/enums/user-role.enum";
import { CustomLoggerService } from "src/common/services/custom-logger.service";
import { DataSource, In, Repository } from "typeorm";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UsersRepository extends Repository<UserEntity> {
	private readonly CLASS_NAME = UsersRepository.name;
	constructor(
		private readonly logger: CustomLoggerService,
		private readonly dataSource: DataSource
	) {
		super(UserEntity, dataSource.createEntityManager());
		logger.setContext(this.CLASS_NAME);
	}

	async findStaffById(userId) {
		try {
			const staff = await this.findOne({
				where: {
					id: userId,
					role: In([UserRole.CASHIER, UserRole.MANAGER, UserRole.ADMIN]),
					deletedAt: null,
				},
			});
			return staff;
		} catch (error) {
			this.logger.error({ message: `[findStaffById] Error: ${error}`, stack: error.stack });
			throw error;
		}
	}
}
