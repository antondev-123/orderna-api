import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { IsValidDateString } from "../../validations/validation.filter";

export class BaseDynamicPeriodFilterDto {
    @ApiProperty({
        example: '2024-01-01',
        description: 'The start date to filter transactions from. This field is required. Format: yyyy-mm-dd'
    })
    @IsNotEmpty()
    @IsValidDateString()
    fromDate: Date;

    @ApiPropertyOptional({
        example: '2024-12-31',
        description: 'The end date to filter transactions to. Format: yyyy-mm-dd'
    })
    @IsOptional()
    @IsValidDateString()
    toDate: Date;
}
