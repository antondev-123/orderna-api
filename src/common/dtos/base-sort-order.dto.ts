import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { SortOrder } from "src/common/constants/enums/sort-order.enum";

export class BaseSortOrderDto {
    @ApiPropertyOptional({
        example: SortOrder.ASC,
        enum: SortOrder,
        description: 'Specifies the order of sorting. Can be "ASC" for ascending or "DESC" for descending order.'
    })
    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder;

    @ApiPropertyOptional({
        example: 'name',
        description: 'The field by which to sort the results.'
    })
    @IsOptional()
    @IsString()
    sortBy?: string;
}
