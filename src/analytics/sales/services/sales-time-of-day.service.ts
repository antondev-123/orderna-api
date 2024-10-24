import { Injectable } from '@nestjs/common';
import { SalesRepository } from '../sales.repository';
import { TimeOfDayFilterDto } from '../dtos/time-of-day.dto';

@Injectable()
export class SalesTimeOfDayService {
    constructor(
        private salesRepository: SalesRepository,
    ) { }
    async getTimeOfDay(filterDto: TimeOfDayFilterDto) {
        try {
            const { page = 1, limit = 10 } = filterDto;
            const offset = (page - 1) * limit;
            const { storeId, fromDate, toDate } = filterDto;

            return await this.salesRepository.getTimeOfDay(storeId, fromDate, toDate, offset, limit)

        } catch (error) {
            throw error;
        }
    }
}