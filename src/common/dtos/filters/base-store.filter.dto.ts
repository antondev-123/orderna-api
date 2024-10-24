import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class BaseStoreFilterDto {
    @ApiPropertyOptional({
        example: 1,
        description: 'The ID of store to filter by'
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    storeId?: number;
}