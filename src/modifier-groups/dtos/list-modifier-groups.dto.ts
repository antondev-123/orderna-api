import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class ListModifierGroupDto {
    @ApiPropertyOptional({
        example: 1,
        description: 'The page number to retrieve, starting from 1.'
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page: number;

    @ApiPropertyOptional({
        example: 100,
        description: 'The number of items to retrieve per page. Default is 100.'
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    size: number;

    @ApiPropertyOptional({
        example: 'searchTerm',
        description: 'A search term to filter the results.'
    })
    @IsOptional()
    @IsString()
    search: string;
}