import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { CommonModule } from "src/common/common.module";
import { DiscountStoreEntity } from "src/discount/entities/discount-stores.entity";
import { DiscountTransactionEntity } from "src/discount/entities/discount-transactions.entity";
import { RefundModule } from "src/refund/refund.module";
import { TransactionModule } from "src/transaction/transaction.module";
import { SalesController } from "./sales.controller";
import { SalesRepository } from "./sales.repository";
import { SalesDiscountService } from "./services/sales-discount.service";
import { SalesRefundService } from "./services/sales-refund.service";
import { SalesFailedService } from "./services/sales-failed.service";
import { SalesRevenueService } from "./services/sales-revenue.service";
import { SalesEndOfDayService } from "./services/sales-end-of-day.service";
import { SalesAverageOrderService } from "./services/sales-average-order.service";
import { SalesDayOfWeekService } from "./services/sales-day-of-week.service";
import { SalesProductService } from "./services/sales-product.service";
import { SalesCategoryService } from "./services/sales-category.service";
import { SalesTimeOfDayService } from "./services/sales-time-of-day.service";
import { SalesTipsByDayService } from "./services/sales-tips-by-day.service";

@Module({
	imports: [RefundModule, TransactionModule, AuthModule, CommonModule, TypeOrmModule.forFeature([DiscountStoreEntity, DiscountTransactionEntity])],
	controllers: [SalesController],
	providers: [
		SalesDiscountService,
		SalesRepository,
		SalesRefundService,
		SalesFailedService,
		SalesRevenueService,
		SalesEndOfDayService,
		SalesAverageOrderService,
		SalesDayOfWeekService,
		SalesProductService,
		SalesCategoryService,
		SalesTimeOfDayService,
		SalesTipsByDayService
	],
})
export class SalesModule { }
