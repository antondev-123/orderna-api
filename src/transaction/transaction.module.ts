import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { CommonModule } from "src/common/common.module";
import { CustomersModule } from "src/customer/customer.module";
import { ProductModule } from "src/product/product.module";
import { StoresModule } from "src/store/stores.module";
import { UsersModule } from "src/user/users.module";
import { TransactionEntity } from "./entities/transaction.entity";
import { TransactionItemRepository } from "./repositories/transaction-item.repository";
import { TransactionRepository } from "./repositories/transaction.repository";
import { TransactionController } from "./transaction.controller";
import { TransactionService } from "./transaction.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([TransactionEntity]),
		AuthModule,
		CustomersModule,
		StoresModule,
		UsersModule,
		ProductModule,
		CommonModule
	],
	controllers: [TransactionController],
	providers: [TransactionService, TransactionRepository, TransactionItemRepository, JwtService],
	exports: [TransactionRepository, TransactionItemRepository]
})
export class TransactionModule { }
