import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { SortByOptions } from 'src/common/constants';
import { BasePaginationDto } from 'src/common/dtos/base-pagination.dto';
import { BaseSortOrderDto } from 'src/common/dtos/base-sort-order.dto';
import { BaseStaticPeriodFilterDto } from 'src/common/dtos/filters/base-static-period.filter.dto';
import { BaseStoreFilterDto } from 'src/common/dtos/filters/base-store.filter.dto';
import { BaseFilterDto } from 'src/common/dtos/filters/base.filter.dto';

export class PurchaseFilterDto extends IntersectionType(
    BaseFilterDto,
    BaseStaticPeriodFilterDto,
    BaseStoreFilterDto,
    BasePaginationDto,
    BaseSortOrderDto,
) {
    @ApiPropertyOptional({
        description: 'Field by which to sort the results',
        enum: Object.values(SortByOptions),
        example: SortByOptions.Inventory,
    })
    @IsOptional()
    @IsEnum(SortByOptions)
    sortBy?: SortByOptions;

    @ApiPropertyOptional({
        description: 'Filter purhase by inventory Id',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    inventoryItemID?: number;

    @ApiProperty({ required: false })
    @ApiPropertyOptional({
        description: 'Filter purhase by supplier Id',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    supplierID?: number;
}