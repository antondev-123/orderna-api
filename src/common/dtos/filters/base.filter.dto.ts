import { ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { BaseStoreFilterDto } from "./base-store.filter.dto";

export class BaseFilterDto extends IntersectionType(BaseStoreFilterDto) {
    @ApiPropertyOptional({
        example: 'Name or item title',
        description: 'The value to be searched'
    })
    @IsOptional()
    @IsString()
    searchValue?: string;
}