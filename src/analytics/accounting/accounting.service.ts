import { Injectable } from '@nestjs/common';
import { pagination } from 'src/common/dtos/pagination-default';
import { AccountingRepository } from './accounting.repository';
import { AnalyticsFilterDto } from './dtos/analytics-filter.dto';
import { DailyEntryDto, DailySummaryResultDto } from './dtos/daily-summary-result.dto';
import { TransactionAnalyticsFilterDto } from './dtos/transaction-analytics-filter.dto';

@Injectable()
export class AccountingService {
    constructor(
        private accountingRepository: AccountingRepository,
    ) { }

    async getDailySummary(
        filterDto: AnalyticsFilterDto
    ) {
        try {
            const skip = this.getSkip(filterDto);
            const take = this.getTake(filterDto);
            const dailySummaryresult = await this.accountingRepository.getDailySummary({
                filterDto,
                skip,
                take
            });

            if (!(dailySummaryresult && dailySummaryresult.length)) {
                return { dailySummary: [], totalRecord: 0 };
            }

            const dailySummaryEntries = (dailySummaryresult).map((transaction) => {
                return <DailyEntryDto>{
                    date: transaction["date"],
                    transactionCount: transaction["count"],
                    revenue: transaction["totalRevenue"],
                    costOfGoodsSold: transaction["totalCost"],
                    grossProfit: transaction["grossProfit"],
                    fees: transaction["totalServiceChargeValue"],
                    tipCount: transaction["totalTipCount"],
                    tips: transaction["totalTipValue"],
                    refundCount: transaction["totalRefundCount"],
                    refunds: transaction["totalRefundValue"],
                }
            })
            const result = await this.accountingRepository.aggregateSummaryDetails(filterDto);
            const dto: DailySummaryResultDto = {
                aggregateTransactionCount: result["count"],
                aggregateRevenue: result["totalRevenue"],
                aggregateCostOfGoodsSold: result["totalCost"],
                aggregateGrossProfit: result["grossProfit"],
                aggregateFees: result["totalServiceChargeValue"],
                aggregateTipsCount: result["totalTipCount"],
                aggregateTips: result["totalTipValue"],
                aggregateRefundsCount: result["totalRefundCount"],
                aggregateRefunds: result["totalRefundValue"],
                dailySummaryEntries: dailySummaryEntries,

            };
            return { result: dto, totalRecord: dailySummaryresult.length };
        } catch (error) {
            throw error;
        }
    }

    async getAllTransactions(filterDto: TransactionAnalyticsFilterDto) {
        try {
            const skip = this.getSkip(filterDto);
            const take = this.getTake(filterDto);

            const result = await this.accountingRepository.getAllTransactions({
                filterDto,
                skip,
                take
            });

            return { result: result, totalRecord: result.length };
        } catch (error) {
            throw error;
        }
    }

    private getSkip(filterDto: TransactionAnalyticsFilterDto) {
        return ((filterDto.page ?? pagination.defaultPage) - 1) *
            (filterDto.limit ?? pagination.pageSize);
    }

    private getTake(filterDto: TransactionAnalyticsFilterDto) {
        return filterDto.limit ?? pagination.pageSize;
    }
}
