import { Module } from "@nestjs/common";
import { RegisterService } from "./register.service";
import { RegisterController } from "./register.controller";
import { AuthModule } from "../../auth/auth.module";
import { CommonModule } from "../../common/common.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CashRegisterEntity } from "../../cash-drawer/entities/cash-register.entity";
import { CashManagementEntity } from "../../cash-drawer/entities/cash-management.entity";
import { RegisterRepository } from "./register.repository";
import { TransactionRepository } from "../../transaction/repositories/transaction.repository";

@Module({
	imports: [AuthModule, CommonModule, TypeOrmModule.forFeature([CashRegisterEntity, CashManagementEntity])],
	providers: [RegisterService, RegisterRepository, TransactionRepository],
	controllers: [RegisterController],
})
export class RegisterModule { }
