import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { CommonModule } from "src/common/common.module";
import { ContactInformationModule } from "src/contact-information/contact-information.module";
import { StoresModule } from "src/store/stores.module";
import { CustomersController } from "./customer.controller";
import { CustomerEntity } from "./customer.entity";
import { CustomersRepository } from "./customer.repository";
import { CustomersService } from "./customer.service";

@Module({
	imports: [
		ContactInformationModule,
		AuthModule,
		TypeOrmModule.forFeature([CustomerEntity]),
		StoresModule,
		CommonModule
	],
	controllers: [CustomersController],
	providers: [CustomersService, CustomersRepository],
	exports: [CustomersRepository]
})
export class CustomersModule { }
