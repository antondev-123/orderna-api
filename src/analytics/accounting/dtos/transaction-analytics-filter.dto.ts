import { ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { TransactionStatus } from "src/common/constants";
import { AnalyticsFilterDto } from "./analytics-filter.dto";

export class TransactionAnalyticsFilterDto extends IntersectionType(AnalyticsFilterDto) {
    @ApiPropertyOptional({
        example: TransactionStatus.APPROVED,
        enum: TransactionStatus,
        description: 'The status of a transaction to filter by'
    })
    @IsOptional()
    @IsEnum(TransactionStatus)
    status?: TransactionStatus;
}