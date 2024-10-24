import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { InventoryItem } from "./inventories.entity";

export class BaseResultDto {

    @ApiProperty({
        example: 'Operation successful',
        description: 'Message indicating the result of the operation.'
    })
    message: string;

    @ApiProperty({
        example: true,
        description: 'Status indicating whether the operation was successful.'
    })
    status: boolean;

}

export class FilterInventoryDto {

    @ApiPropertyOptional({
        example: 'period',
        description: "Filter type: \"period\", \"storeID\""
    })
    @IsOptional()
    @Type(() => String)
    @IsString()
    filterType?: string;

    @ApiPropertyOptional({
        example: '#storeID',
        description: "Filter Text: #storeID"
    })
    @IsOptional()
    @Type(() => String)
    @IsString()
    filterText?: string;

    @ApiPropertyOptional({
        example: 7,
        description: "LimitDate: #limitDate to filter in period filter type"
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limitDate?: number;

    @ApiProperty({
        example: 0,
        description: "page: page number to pagination. started from zero"
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page: number;

    @ApiProperty({
        example: 10,
        description: "pageSize: size of inventory in result, default is 10"
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    pageSize: number;

    @ApiPropertyOptional({
        example: 'storeID',
        description: "sortBy: sort by fields: \"title\", \"storeID\", \"unit\", \"sk_plu\""
    })
    @IsOptional()
    @Type(() => String)
    @IsString()
    sortBy?: string;

    @ApiPropertyOptional({
        example: 'asc',
        description: "sortType: sorting order: \"asc\" or \"desc\" or \"ASC\", or \"DESC\""
    })
    @IsOptional()
    @Type(() => String)
    @IsString()
    sortType?: string;

}

export class FilterInventoriesResultDto extends BaseResultDto {
    @ApiProperty({
        description: 'Array of inventory items matching the filter criteria.',
        type: [InventoryItem]
    })
    object: Partial<InventoryItem>[];
}

export class CreateInventoryItemDto {
    @ApiProperty({
        example: 111,
        description: 'The ID of the store the inventory item belongs to.'
    })
    @Type(() => Number)
    @IsNumber()
    storeID: number;

    @ApiProperty({
        example: 'Cheese',
        description: 'The title or name of the inventory item.'
    })
    @Type(() => String)
    @IsString()
    title: string;

    @ApiProperty({
        example: 'kg',
        description: 'The unit of measurement for the inventory item.'
    })
    @Type(() => String)
    @IsString()
    unit: string;

    @ApiProperty({
        example: 'test sk_plu',
        description: 'The SKU/PLU code of the inventory item.'
    })
    @Type(() => String)
    @IsString()
    sk_plu: string;
}

export class CreateInventoryItemResultDto extends BaseResultDto {
    @ApiProperty({
        description: 'The created inventory item object.',
        type: InventoryItem
    })
    object: Partial<InventoryItem>;
}

export class EditInventoryItemDto extends CreateInventoryItemDto {
}

export class EditInventoryItemResultDto extends BaseResultDto {
    @ApiProperty({
        description: 'The updated  inventory item object.',
        type: InventoryItem
    })
    object: Partial<InventoryItem>;
}

export class DeleteInventoryItemResultDto extends BaseResultDto {
}

export class BulkDeleteInventoryItemsResultDto extends BaseResultDto {
}

export enum SortByEnum {
    id = 'inventoryItemID',
    title = 'title',
    unit = 'unit',
    storeID = 'storeID',
    sk_plu = 'sk_plu'
}

export enum SortTypeEnum {
    asc = 'asc',
    desc = 'desc',
    ASC = 'ASC',
    DESC = 'DESC'
}

export class GetAllInventoriesDataDto {
    @ApiProperty({
        example: 0,
        description: 'The page number for pagination, starting from zero.'
    })
    pageNum: number;
    @ApiProperty({
        example: 10,
        description: 'The number of items per page for pagination, default is 10.'
    })
    pageSize: number;
    @ApiProperty({
        example: { field: 'storeID', order: 'asc' },
        description: 'The object containing sorting field and order.'
    })
    orderObject: any
}

export class GetInventoriesFilterByDate extends GetAllInventoriesDataDto {
    @ApiProperty({
        example: '2024-07-01',
        description: 'The date used to filter inventory items created on or after this date.'
    })
    createdAtFilterTime: string;
}

export class GetInventoriesFilterByStoreID extends GetAllInventoriesDataDto {
    @ApiProperty({
        example: 111,
        description: 'The ID of the store used to filter inventory items.'
    })
    storeID: number;
}


export class DeleteInventoriesDto {
    @ApiPropertyOptional({
        description: 'Ids to be deleted',
        example: [1, 2, 3],
        type: [Number]
    })
    @IsArray()
    @IsNumber({}, { each: true })
    @Type(() => Number)
    ids: number[];
}