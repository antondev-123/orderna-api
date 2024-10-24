export class PropertiesDiscountDto {
    stores?: { id: number, name: string }[];
    dates?: { id: string, name: string }[]
    status: {
        allCount: number;
        activeCount: number;
        expiredCount: number;
        archivedCount: number;
        scheduledCount: number;
    };
    discountStatus?: { id: string, name: string }[];
    discountType?: { id: string, name: string }[];
}