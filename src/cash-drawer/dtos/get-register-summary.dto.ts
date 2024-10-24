import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class GetRegisterSummaryDto {
	@ApiPropertyOptional({
		example: 1,
		description: 'The page number for pagination, starting from 1.'
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	page: number;

	@ApiPropertyOptional({
		example: 10,
		description: 'The number of items per page for pagination.'
	})
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	size: number;
}
