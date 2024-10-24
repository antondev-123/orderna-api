import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceEntity } from 'src/attendance/attendance.entity';
import { attendanceResponseMessage, errorResponseMessage } from 'src/common/constants';
import { breakResponseMessage } from 'src/common/constants/response-messages/break.response-message';
import { Repository } from 'typeorm';
import { BreakEntity } from './break.entity';
import { CreateBreakDto } from './dtos/create-break.dto';
import { EditBreakDto } from './dtos/edit-break.dto';
import { BreakIdDto } from './dtos/params-break.dto';

@Injectable()
export class BreakService {
    constructor(
        @InjectRepository(BreakEntity)
        private breakRepository: Repository<BreakEntity>,
        @InjectRepository(AttendanceEntity)
        private attendanceRepository: Repository<AttendanceEntity>

    ) { }

    async addBreak(createBreakDto: CreateBreakDto) {
        try {
            const attendance = await this.attendanceRepository.findOne({
                where: { id: createBreakDto.attendanceId }
            });

            if (!attendance) {
                throw new NotFoundException(
                    attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            const breakData = this.breakRepository.create(createBreakDto);
            await this.breakRepository.save(breakData);

            return breakData


        } catch (error) {
            throw error;
        }
    }

    async editBreak(breakIdDto: BreakIdDto, editBreakDto: EditBreakDto) {
        try {
            const attendance = await this.attendanceRepository.findOne({
                where: { id: editBreakDto.attendanceId }
            });

            const breakData = await this.breakRepository.findOne({
                where: { id: breakIdDto.breakId },
            });

            if (!breakData) {
                throw new NotFoundException(
                    breakResponseMessage.BREAK_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            if (!attendance) {
                throw new NotFoundException(
                    attendanceResponseMessage.ATTENDANCE_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            Object.assign(breakData, editBreakDto);
            await this.breakRepository.save(breakData);
            return breakData

        } catch (error) {
            throw error;
        }
    }

    async deleteBreak(breakIdDto: BreakIdDto) {
        try {
            const breakData = await this.breakRepository.findOne({
                where: { id: breakIdDto.breakId },
            });

            if (!breakData) {
                throw new NotFoundException(
                    breakResponseMessage.BREAK_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                )
            }

            await this.breakRepository.remove(breakData);
            return breakData
        } catch (error) {
            throw error;
        }
    }

}
