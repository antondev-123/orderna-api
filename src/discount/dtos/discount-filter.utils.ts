// src/utils/filterUtils.ts

import { SelectQueryBuilder, Brackets } from 'typeorm';
import * as moment from 'moment';
import { DiscountType } from '../enums/discount-type.enum';
import { DiscountStatus } from '../enums/discount-status.enum';
import { DiscountRangeDate } from '../enums/discount-rangedate.enum';

export const DiscountFilterUtils = (
    queryBuilder: SelectQueryBuilder<any>,
    search: string,
    date: string = 'alltime',
    storeId: number,
    status: string,
    sortby: string,
    limit: number,
    page: number
) => {
    // Query => search
    if (search) {
        queryBuilder.andWhere(
            new Brackets(qb => {
                qb.where('discountName LIKE :search', { search: `%${search}%` })
                    .orWhere('discountCode LIKE :search', { search: `%${search}%` });
            })
        );
    }

    // Query => storeId

    if (storeId) {

        queryBuilder.andWhere('storeId = :storeId', { storeId: storeId });
    }

    // Query date payload
    let startDate: string;
    let endDate: string;
    switch (date) {
        case 'today':
            startDate = moment().startOf('day').format('YYYY-MM-DD');
            endDate = moment().endOf('day').format('YYYY-MM-DD');
            break;
        case 'last7days':
            startDate = moment().subtract(7, 'days').startOf('day').format('YYYY-MM-DD');
            endDate = moment().endOf('day').format('YYYY-MM-DD');
            break;
        case 'lastmonth':
            startDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
            endDate = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
            break;
        case 'lastyear':
            startDate = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
            endDate = moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD');
            break;
        case 'alltime':
            startDate = moment('2000-01-01').format('YYYY-MM-DD');
            endDate = moment().endOf('day').format('YYYY-MM-DD');
            break;
    }

    // Query => date
    if (date !== 'alltime') {
        queryBuilder.andWhere('DATE(createdAt) BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    // Query => status
    if (status) {
        queryBuilder.andWhere('discountStatus = :discountStatus', { discountStatus: status });
    }

    // Query => sortby
    if (sortby && sortby !== 'totalUsed') {
        queryBuilder.orderBy(`discounts.${sortby}`, 'ASC');
    } else {
        queryBuilder.orderBy('discounts.discountID', 'DESC');
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    return queryBuilder;
}

export const OptDiscountType = [
    { id: DiscountType.ALL_ITEMS, name: 'All Items' },
    { id: DiscountType.TOTAL_DISCOUNT, name: 'Total Discount' },
    { id: DiscountType.ONE_ITEM, name: '1 Item' },
]

export const OptDiscountStatus = [
    { id: DiscountStatus.ACTIVE, name: 'Active' },
    { id: DiscountStatus.SCHEDULED, name: 'Scheduled' },
    { id: DiscountStatus.EXPIRED, name: 'Expired' },
    { id: DiscountStatus.ARCHIVED, name: 'Archived' },
]

export const OptDiscountRangeDate = [
    { id: DiscountRangeDate.ALL_TIME, name: 'All Time' },
    { id: DiscountRangeDate.TODAY, name: 'Today' },
    { id: DiscountRangeDate.LAST_7DAYS, name: 'Last 7 Days' },
    { id: DiscountRangeDate.LAST_MONTH, name: 'Last Month' },
    { id: DiscountRangeDate.LAST_YEAR, name: 'Last Year' },
]