import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { cashRegisterResponseMessage, errorResponseMessage } from "src/common/constants/response-messages";
import { pagination } from "src/common/dtos/pagination-default";
import { Repository } from "typeorm";
import { CashManagementRepository, CashRegisterRepository } from "./cash-drawer.repository";
import { AddCashManagementDto } from "./dtos/add-cash-management.dto";
import { CloseRegisterDto } from "./dtos/close-register.dto";
import { EditCashManagementDto } from "./dtos/edit-cash-management.dto";
import { GetRegisterSummaryDto } from "./dtos/get-register-summary.dto";
import { OpenRegisterDto } from "./dtos/open-register.dto";
import { CashManagementEntity } from "./entities/cash-management.entity";
import { CashRegisterEntity } from "./entities/cash-register.entity";

@Injectable()
export class CashDrawerService {
	constructor(
		@InjectRepository(CashRegisterEntity)
		private cashRegisterEntity: Repository<CashRegisterEntity>,
		@InjectRepository(CashRegisterRepository)
		private cashRegisterRepository: CashRegisterRepository,
		@InjectRepository(CashManagementEntity)
		private cashManagementEntity: Repository<CashManagementEntity>,
		@InjectRepository(CashManagementRepository)
		private cashManagementRepository: CashManagementRepository,
	) {}

	async openRegister(openRegisterDto: OpenRegisterDto, tokenData: any) {
		try {
			const openRegister: Partial<CashRegisterEntity> = this.cashRegisterEntity.create({
				//TODO: choose cash register from dropdown
				registerName: "Test Cash Register 1",
				opened: openRegisterDto.opened,
				amount: openRegisterDto.amount,
				openNote: openRegisterDto.openNote,
				store: {
					id: parseInt(openRegisterDto.storeId),
				},
				user: tokenData.object.id,
			});

			return await this.cashRegisterEntity.save(openRegister);
		} catch (error) {
			throw error;
		}
	}

	async getRegisterSummary(getRegisterSummaryDto: GetRegisterSummaryDto) {
		try {
			const skip = ((getRegisterSummaryDto.page ?? pagination.defaultPage) - 1) * (getRegisterSummaryDto.size ?? pagination.pageSize);
			const take = getRegisterSummaryDto.size ?? pagination.pageSize;

			const [getRegister, total_record] = await this.cashRegisterRepository.findCashRegisterList(skip, take);
			if (!getRegister) {
				return { getRegister: [], total_record: 0 };
			}
			return { getRegister: getRegister, total_record: total_record };
		} catch (error) {
			throw error;
		}
	}

	async closeRegister(registerId: number, closeRegisterDto: CloseRegisterDto) {
		try {
			const updateResult = await this.cashRegisterRepository.findCashRegisterById(registerId);
			if (!updateResult) {
				throw new NotFoundException(cashRegisterResponseMessage.CASH_REGISTER_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}
			Object.assign(updateResult, closeRegisterDto);
			await this.cashRegisterRepository.save(updateResult);
			return updateResult;
		} catch (error) {
			throw error;
		}
	}

	async getRegisterSummaryDetails(registerId: number) {
		try {
			const registerSummary = await this.cashRegisterRepository.findCashRegisterById(registerId);
			if (!registerSummary) {
				throw new NotFoundException(cashRegisterResponseMessage.CASH_REGISTER_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}
			return registerSummary;
		} catch (error) {
			throw error;
		}
	}

	async addCashManagement(addCashManagementDto: AddCashManagementDto, registerId: number) {
		try {
			const incomingData: Partial<CashManagementEntity> = this.cashManagementEntity.create({
				cashIn: addCashManagementDto.cashIn,
				cashOut: addCashManagementDto.cashOut,
				isExpense: addCashManagementDto.isExpense,
				note: addCashManagementDto.note,
				cashRegisterEntity: {
					id: registerId,
				},
			});

			const cashManagementData = await this.cashManagementEntity.save(incomingData);
			return cashManagementData;
		} catch (error) {
			throw error;
		}
	}

	async editCashManagement(registerId: number, cashManagementId: number, editCashManagementDto: EditCashManagementDto) {
		try {
			const existingResult = await this.cashManagementRepository
				.createQueryBuilder("cashManagement")
				.where("cashManagement.cashRegisterId = :registerId", { registerId })
				.andWhere("cashManagement.id  = :cashManagementId", { cashManagementId })
				.getOne();
			if (!existingResult) {
				throw new NotFoundException(cashRegisterResponseMessage.CASH_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}
			const incomingData: Partial<CashManagementEntity> = this.cashManagementRepository.create({
				cashIn: editCashManagementDto.cashIn,
				cashOut: editCashManagementDto.cashOut,
				isExpense: editCashManagementDto.isExpense,
				note: editCashManagementDto.note,
			});

			Object.assign(existingResult, incomingData);
			const updatedData = await this.cashManagementRepository.save(existingResult);
			return updatedData;
		} catch (error) {
			throw error;
		}
	}
}
