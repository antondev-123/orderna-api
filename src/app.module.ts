import secureSession from "@fastify/secure-session";
import { CacheModule } from "@nestjs/cache-manager";
import {
	HttpStatus,
	Module,
	OnModuleInit,
	ValidationPipe,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_PIPE, HttpAdapterHost } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsModule } from "./analytics/analytics.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AttendanceModule } from "./attendance/attendance.module";
import { AuthModule } from "./auth/auth.module";
import { CashDrawerModule } from "./cash-drawer/cash-drawer.module";
import { CategoryModule } from "./category/category.module";
import { CommonModule } from "./common/common.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { RedisOptions, TypeOrmConfigService } from "./configs";
import { CustomersModule } from "./customer/customer.module";
import { DashboardAnalyticsModule } from "./dashboard-analytics/dashboard-analytics.module";
import { DiscountModule } from "./discount/discount.module";
import { InventoriesModule } from "./inventory/inventories.module";
import { ModifierModule } from "./modifier-groups/modifier-groups.module";
import { ProductModule } from "./product/product.module";
import { RedisHelperModule } from "./redis/redis-helper.module";
import { RefundModule } from "./refund/refund.module";
import { StoresModule } from "./store/stores.module";
import { SupplierModule } from "./supplier/supplier.module";
import { TransactionModule } from "./transaction/transaction.module";
import { UsersModule } from "./user/users.module";
import { WageModule } from "./wage/wage.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `environments/.env.${process.env.NODE_ENV}`,
		}),
		CacheModule.registerAsync(RedisOptions),
		TypeOrmModule.forRootAsync({
			useClass: TypeOrmConfigService,
		}),
		RedisHelperModule,
		SupplierModule,
		UsersModule,
		AuthModule,
		DiscountModule,
		AttendanceModule,
		CategoryModule,
		CustomersModule,
		ProductModule,
		TransactionModule,
		StoresModule,
		InventoriesModule,
		CashDrawerModule,
		WageModule,
		AnalyticsModule,
		CommonModule,
		ModifierModule,
		DashboardAnalyticsModule,
		RefundModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({
				transform: true,
				whitelist: true,
				forbidNonWhitelisted: true,
				forbidUnknownValues: true,
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				stopAtFirstError: true,
			}),
		},
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
	],
})
export class AppModule implements OnModuleInit {
	constructor(
		private readonly httpAdapterHost: HttpAdapterHost,
		private configService: ConfigService,
	) {}
	onModuleInit() {
		const adapterInstance = this.httpAdapterHost.httpAdapter.getInstance();
		adapterInstance.register(secureSession, {
			secret: this.configService.get("SESSION_SECRET"),
			salt: this.configService.get("SESSION_SALT"),
		});
	}
}
