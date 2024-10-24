import { DiscountRangeDate } from "../enums/discount-rangedate.enum"
import { DiscountStatus } from "../enums/discount-status.enum"
import { DiscountType } from "../enums/discount-type.enum"

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