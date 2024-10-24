import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceEntity } from 'src/attendance/attendance.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { BreakController } from './break.controller';
import { BreakEntity } from './break.entity';
import { BreakService } from './break.service';

@Module({
    imports: [
        AuthModule,
        CommonModule,
        TypeOrmModule.forFeature([BreakEntity, AttendanceEntity])],
    providers: [BreakService],
    controllers: [BreakController]
})
export class BreakModule { }
