export class GetDiscountDto {
    discountId: number;
    discountCode: string;
    discountName: string;
    storeName: string;
    totalUsed: number;
    discountType: string;
    discountValue: number;
    discountStatus: string;
    startDate: Date | string;
    endDate: Date | string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}