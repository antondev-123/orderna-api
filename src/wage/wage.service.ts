import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WageEntity } from './wage.entity';
import { Repository } from 'typeorm';
import { CreateWageDto } from './dtos/create-wage.dto';
import { AttendanceEntity } from 'src/attendance/attendance.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { WageIdDto } from './dtos/params-wage.dto';
import { EditWageDto } from './dtos/edit-wage.dto';
import { attendanceResponseMessage, errorResponseMessage, userResponseMessage } from 'src/common/constants';
import { wageResponseMessage } from 'src/common/constants/response-messages/wage.response-messagge';

@Injectable()
export class WageService {
    constructor(
        @InjectRepository(WageEntity)
        private wageRepository: Repository<WageEntity>,
        @InjectRepository(AttendanceEntity)
        private attendanceRepository: Repository<AttendanceEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) { }

    async addWage(createWageDto: CreateWageDto) {
        try {
            const attendance = await this.attendanceRepository.findOne({
                where: { id: createWageDto.attendanceId }
            });

            if (!attendance) {
                throw new NotFoundException(
                    attendanceResponseMessage.ATTENDANCE_NOT_FOUND,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            const user = await this.userRepository.findOne({
                where: { id: createWageDto.userId }
            })

            if (!user) {
                throw new NotFoundException(
                    userResponseMessage.USER_NOT_FOUND,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            const wage = this.wageRepository.create(createWageDto);
            await this.wageRepository.save(wage);

            return wage
        } catch (error) {
            throw error;
        }
    }

    async editWage(wageIdDto: WageIdDto, editWageDto: EditWageDto) {
        try {
            const attendance = await this.attendanceRepository.findOne({
                where: { id: editWageDto.attendanceId }
            });

            if (!attendance) {
                throw new NotFoundException(
                    attendanceResponseMessage.ATTENDANCE_NOT_FOUND,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            const user = await this.userRepository.findOne({
                where: { id: editWageDto.userId }
            })

            if (!user) {
                throw new NotFoundException(
                    userResponseMessage.USER_NOT_FOUND,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            const wage = await this.wageRepository.findOne({
                where: { id: wageIdDto.wageId },
            });

            if (!wage) {
                throw new NotFoundException(
                    wageResponseMessage.WAGE_NOT_FOUND,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            Object.assign(wage, editWageDto);
            await this.wageRepository.save(wage);
            return wage;

        } catch (error) {
            throw error;
        }
    }

    async deleteWage(wageIdDto: WageIdDto) {
        try {
            const wage = await this.wageRepository.findOne({
                where: { id: wageIdDto.wageId },
            });

            if (!wage) {
                throw new NotFoundException(
                    wageResponseMessage.WAGE_NOT_FOUND,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            await this.wageRepository.remove(wage);
            return wage
        } catch (error) {
            throw error;
        }
    }

}
