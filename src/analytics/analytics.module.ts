import { Module } from "@nestjs/common";
import { AccountingModule } from "./accounting/accounting.module";
import { SalesModule } from "./sales/sales.module";
import { RegisterModule } from "./register/register.module";

@Module({
	imports: [AccountingModule, SalesModule, RegisterModule],
})
export class AnalyticsModule {}
