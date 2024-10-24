import { Injectable } from "@nestjs/common";
import { ProductRepository } from "src/product/product.repository";
import { StoreRepository } from "src/store/repository/store.repository";
import { TransactionEntity } from "src/transaction/entities/transaction.entity";
import { TransactionItemRepository } from "src/transaction/repositories/transaction-item.repository";
import { TransactionRepository } from "src/transaction/repositories/transaction.repository";
import { SelectQueryBuilder } from "typeorm";
import { AllTransactionsResultDto } from "./dtos/all-transactions-result.dto";
import { AnalyticsFilterDto } from "./dtos/analytics-filter.dto";
import { DailyEntryDto } from "./dtos/daily-summary-result.dto";
import { TransactionAnalyticsFilterDto } from "./dtos/transaction-analytics-filter.dto";
import { Store } from "src/store/entities/store.entity";

@Injectable()
export class AccountingRepository {
    constructor(
        private readonly transactionRepo: TransactionRepository,
        private readonly transactionItemRepo: TransactionItemRepository,
        private readonly productRepo: ProductRepository,
        private readonly storeRepo: StoreRepository,
        //TODO: add
        // private readonly purchaseRepo: PurchaseRepository,
    ) { }

    async getDailySummary({
        filterDto,
        skip,
        take,
    }: Partial<{
        filterDto: AnalyticsFilterDto,
        skip: number;
        take: number;
    }>): Promise<DailyEntryDto[]> {
        try {
            const query = await this.transactionRepo.createQueryBuilder("transaction");
            this.applyDateFilter(query, filterDto.fromDate, filterDto.toDate);

            query.leftJoinAndSelect('transaction.store', 'store')
                .groupBy('DATE(transaction.createdAt)')
                .select('DATE(transaction.createdAt)', 'date')
                .addSelect('COUNT(transaction.id)', 'count')
                .addSelect('IFNULL(SUM(transaction.totalValue),0)', 'totalRevenue')
                .addSelect('IFNULL(SUM(transaction.totalCost),0)', 'totalCost')
                .addSelect('IFNULL(SUM(transaction.totalValue) - SUM(transaction.totalCost),0)', 'grossProfit')
                .addSelect('IFNULL(SUM(transaction.totalValue * transaction.serviceChargeRate),0)', 'totalServiceChargeValue')
                .addSelect('IFNULL(SUM(transaction.tip),0)', 'totalTipValue')
                .addSelect('COUNT(transaction.tip)', 'totalTipCount')
                .addSelect('IFNULL(SUM(transaction.refund),0)', 'totalRefundValue')
                .addSelect('COUNT(transaction.refund)', 'totalRefundCount')

            this.applyStoreFilter(query, filterDto.storeId);
            this.applyPagination(query, take, skip);

            return await query.getRawMany();
        } catch (error) {
            throw error;
        }
    }

    async aggregateSummaryDetails(filterDto: AnalyticsFilterDto) {
        try {
            const query = await this.transactionRepo.createQueryBuilder("transaction")
                .select('COUNT(transaction.id)', 'count')
                .addSelect('IFNULL(SUM(transaction.totalValue),0)', 'totalRevenue')
                .addSelect('IFNULL(SUM(transaction.totalCost),0)', 'totalCost')
                .addSelect('IFNULL(SUM(transaction.totalValue) - SUM(transaction.totalCost),0)', 'grossProfit')
                .addSelect('IFNULL(SUM(transaction.totalValue * transaction.serviceChargeRate),0)', 'totalServiceChargeValue')
                .addSelect('IFNULL(SUM(transaction.tip),0)', 'totalTipValue')
                .addSelect('COUNT(transaction.tip)', 'totalTipCount')
                .addSelect('IFNULL(SUM(transaction.refund),0)', 'totalRefundValue')
                .addSelect('COUNT(transaction.refund)', 'totalRefundCount') //TODO: need to wait for refund API

            this.applyDateFilter(query, filterDto.fromDate, filterDto.toDate);
            this.applyStoreFilter(query, filterDto.storeId);

            return await query.getRawOne();

        } catch (error) {
            throw error;
        }
    }

    async getAllTransactions({
        filterDto,
        skip,
        take,
    }: Partial<{
        filterDto: TransactionAnalyticsFilterDto,
        skip: number;
        take: number;
    }>): Promise<AllTransactionsResultDto[]> {
        try {
            const query = await this.transactionRepo.createQueryBuilder("transaction");
            this.applyDateFilter(query, filterDto.fromDate, filterDto.toDate);

            query.leftJoinAndSelect('transaction.store', 'store')
                .select('DATE(transaction.createdAt)', 'date')
                .addSelect('transaction.paymentType', 'paymentType')
                .addSelect('transaction.status', 'status')
                .addSelect('transaction.totalValue', 'totalRevenue')
                .addSelect('transaction.totalCost', 'totalCost')
                .addSelect('transaction.totalValue - transaction.totalCost', 'grossProfit')
                .addSelect('IFNULL((transaction.totalValue * transaction.serviceChargeRate), 0)', 'serviceChargeValue')
                .addSelect('IFNULL(transaction.tip, 0)', 'totalTipValue')
                .addSelect('transaction.totalValue * transaction.salesTaxRate', 'taxValue')
                .addSelect('IFNULL(transaction.refund, 0)', 'refundValue')
                .andWhere('transaction.status = :status', { status: filterDto.status })

            this.applyStoreFilter(query, filterDto.storeId);

            this.applyPagination(query, take, skip);
            return await query.getRawMany();
        } catch (error) {
            throw error;
        }
    }

    private applyPagination(query: SelectQueryBuilder<TransactionEntity>, take?: number, skip?: number) {
        if (take) query.take(take);
        if (skip) query.skip(skip);
    }

    private applyStoreFilter(query: SelectQueryBuilder<TransactionEntity>, storeId: Store['id']) {
        if (storeId) {
            query.andWhere('store.id = :storeId',
                { storeId }
            );
        }
    }

    private applyDateFilter(query: SelectQueryBuilder<TransactionEntity>, fromDate: Date, toDate: Date) {
        const currentDate = new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");

        query.where("transaction.createdAt BETWEEN :fromDate AND :toDate",
            {
                fromDate,
                toDate: toDate || currentDate
            }
        );
    }
}
