import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { IsValidDateString } from "src/common/validations/validation.filter";

export class FilterCustomerDto extends IntersectionType(PaginationDto) {
    @ApiPropertyOptional({
        example: 'Main Store',
        description: 'The name of the store to filter customers by.'
    })
    @IsOptional()
    store?: string;

    @ApiProperty({
        example: '2024-01-01',
        description: 'The start date for filtering customers, in the format YYYY-MM-DD.'
    })
    @IsNotEmpty()
    @IsValidDateString()
    fromDate: Date;

    @ApiPropertyOptional({
        example: '2024-12-31',
        description: 'The end date for filtering customers, in the format YYYY-MM-DD.'
    })
    @IsOptional()
    @IsValidDateString()
    toDate?: Date;
}