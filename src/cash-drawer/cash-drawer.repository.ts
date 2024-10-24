import { Injectable } from "@nestjs/common";
import { CustomLoggerService } from "src/common/services/custom-logger.service";
import { DataSource, EntityRepository, Repository } from "typeorm";
import { CashManagementEntity } from "./entities/cash-management.entity";
import { CashRegisterEntity } from "./entities/cash-register.entity";

@Injectable()
export class CashRegisterRepository extends Repository<CashRegisterEntity> {
	constructor(
		private readonly dataSource: DataSource
	) {
		super(CashRegisterEntity, dataSource.createEntityManager());
	}

	async findCashRegisterList(skip, take) {
		try {
			const query = this.createQueryBuilder("cash_register")
				.leftJoinAndSelect("cash_register.user", "user")
				.select([
					"cash_register.id",
					"cash_register.opened",
					"cash_register.closed",
					"cash_register.counted",
					"cash_register.amount",
					"cash_register.openNote",
					"cash_register.closeNote",
					"user.id",
					"user.username",
				]);
			const count = await query.getCount();

			const CashRegister = await query.take(take).skip(skip).getMany();
			return [CashRegister, count];
		} catch (error) {
			throw error;
		}
	}

	async findCashRegisterById(openRegisterID) {
		try {
			const result = await this.findOne({
				where: {
					id: openRegisterID,
					deletedAt: null,
				},
			});

			return result;
		} catch (error) {
			throw error;
		}
	}
}

@Injectable()
@EntityRepository(CashManagementEntity)
export class CashManagementRepository extends Repository<CashManagementEntity> {
	private readonly CLASS_NAME = CashManagementRepository.name;
	constructor(
		private readonly logger: CustomLoggerService,
		private readonly dataSource: DataSource

	) {
		super(CashManagementEntity, dataSource.createEntityManager());
		logger.setContext(this.CLASS_NAME);
	}
	async findCashManagementById(openRegisterID) {
		try {
			const result = await this.findOne({
				where: {
					id: openRegisterID,
					deletedAt: null,
				},
			});

			return result;
		} catch (error) {
			throw error;
		}
	}
}
