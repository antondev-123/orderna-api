import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class BasePaginationDto {
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
	limit: number;
}
