import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { CashRegisterEntity } from "../../cash-drawer/entities/cash-register.entity";

@Injectable()
export class RegisterRepository {
	constructor(
		@InjectRepository(CashRegisterEntity)
		private readonly cashRegisterRepository: Repository<CashRegisterEntity>,
	) { }

	async findCashRegister(storeId: number, fromDate: Date, toDate: Date, offset: number, limit: number) {
		try {
			const currentDate: Date = new Date();
			const register = await this.cashRegisterRepository.find({
				relations: ["cashManagementEntity", "store"],
				where: {
					store: {
						id: storeId,
					},
					createdAt: Between(fromDate, (toDate ?? currentDate)),
				},
				order: {
					createdAt: "DESC",
				},
				take: limit,
				skip: offset,
			});
			const count = await this.cashRegisterRepository.count({
				where: {
					store: {
						id: storeId,
					},
					createdAt: Between(fromDate, toDate),
				},
			});

			return {
				data: register,
				count: count,
			};
		} catch (error) {
			throw error;
		}
	}
}
