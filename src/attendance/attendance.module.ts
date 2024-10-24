import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { CommonModule } from "src/common/common.module";
import { WageEntity } from "src/wage/wage.entity";
import { AttendanceController } from "./attendance.controller";
import { AttendanceEntity } from "./attendance.entity";
import { AttendanceService } from "./attendance.service";
import { BreakModule } from "./break/break.module";

@Module({
	imports: [
		AuthModule,
		CommonModule,
		BreakModule,
		TypeOrmModule.forFeature([AttendanceEntity, WageEntity]
		)],
	providers: [AttendanceService],
	controllers: [AttendanceController],
})
export class AttendanceModule { }
