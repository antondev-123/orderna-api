import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { CommonModule } from "src/common/common.module";
import { UserEntity } from "src/user/entities/user.entity";
import { CashDrawerController } from "./cash-drawer.controller";
import { CashManagementRepository, CashRegisterRepository } from "./cash-drawer.repository";
import { CashDrawerService } from "./cash-drawer.service";
import { CashManagementEntity } from "./entities/cash-management.entity";
import { CashRegisterEntity } from "./entities/cash-register.entity";

@Module({
	imports: [AuthModule, TypeOrmModule.forFeature([CashRegisterEntity, UserEntity, CashManagementEntity]), CommonModule],
	controllers: [CashDrawerController],
	providers: [CashDrawerService, CashRegisterRepository, CashManagementRepository],
	exports: [CashRegisterRepository, CashManagementRepository],
})
export class CashDrawerModule {}
