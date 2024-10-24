import { Module } from '@nestjs/common';
import { WageService } from './wage.service';
import { WageController } from './wage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WageEntity } from './wage.entity';
import { AttendanceEntity } from 'src/attendance/attendance.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    AuthModule,
    CommonModule,
    TypeOrmModule.forFeature([WageEntity, AttendanceEntity, UserEntity])],
  providers: [WageService],
  controllers: [WageController]
})
export class WageModule { }
