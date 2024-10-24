import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { CommonModule } from "src/common/common.module";
import { ContactInformationModule } from "src/contact-information/contact-information.module";
import { UsersRepository } from "src/user/users.repository";
import { UserEntity } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";


@Module({
	imports: [
		ContactInformationModule,
		AuthModule,
		TypeOrmModule.forFeature([UserEntity]),
		CommonModule
	],
	controllers: [UsersController],
	providers: [UsersService, UsersRepository],
	exports: [UsersRepository]
})
export class UsersModule { }
