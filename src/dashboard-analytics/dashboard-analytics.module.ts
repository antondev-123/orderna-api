import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { ProductRepository } from "src/product/product.repository";
import { StoreRepository } from "src/store/repository/store.repository";
import { TransactionModule } from "src/transaction/transaction.module";
import { DashboardAnalyticsController } from "./dashboard-analytics.controller";
import { TransactionRepository } from "../transaction/repositories/transaction.repository";
import { TransactionItemEntity } from "../transaction/entities/transaction-item.entity";
import { ProductEntity } from "../product/product.entity";
import { Store } from "../store/entities/store.entity";
import { DashboardAnalyticsService } from "./dashboard-analytics.service";

@Module({
	imports: [AuthModule, TransactionModule, TypeOrmModule.forFeature([ProductEntity, Store, TransactionItemEntity])],
	providers: [TransactionRepository, ProductRepository, StoreRepository, DashboardAnalyticsService],
	controllers: [DashboardAnalyticsController],
})
export class DashboardAnalyticsModule {}
