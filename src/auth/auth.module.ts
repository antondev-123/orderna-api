import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommonModule } from "src/common/common.module";
import { ContactInformationModule } from "src/contact-information/contact-information.module";
import { RedisHelperModule } from "src/redis/redis-helper.module";
import { UserEntity } from "src/user/entities/user.entity";
import { TokenService } from "src/user/utils/commonServices/jwtToken.service";
import { PasswordService } from "src/user/utils/commonServices/password.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
	imports: [
		ContactInformationModule,
		TypeOrmModule.forFeature([UserEntity]),
		RedisHelperModule,
		CommonModule
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		ConfigService,
		PasswordService,
		TokenService,
		JwtService,
	],
	exports: [AuthService, RedisHelperModule, JwtService],
})
export class AuthModule { }
