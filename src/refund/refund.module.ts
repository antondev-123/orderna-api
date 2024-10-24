import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { CommonModule } from "../common/common.module";
import { TransactionRepository } from "../transaction/repositories/transaction.repository";
import { RefundItemsEntity } from "./entities/refund-items.entity";
import { RefundEntity } from "./entities/refund.entity";
import { RefundController } from "./refund.controller";
import { RefundService } from "./refund.service";
import { RefundItemsRepository } from "./respositories/refund-items.repository";
import { RefundRepository } from "./respositories/refund.repository";

@Module({
	imports: [AuthModule, CommonModule, TypeOrmModule.forFeature([RefundEntity, RefundItemsEntity])],
	controllers: [RefundController],
	providers: [RefundService, TransactionRepository, RefundRepository, RefundItemsRepository],
	exports: [RefundRepository, RefundItemsRepository]
})
export class RefundModule { }
