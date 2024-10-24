import { ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsDateString,
	IsOptional,
} from "class-validator";

export class FilterDetailDiscountSummaryDto {
	@ApiPropertyOptional({
		example: '2024-01-01',
		description: 'startDate, format(YYYY-MM-DD)'
	})
	@IsOptional()
	@IsDateString()
	startDate?: string

	@ApiPropertyOptional({
		example: '2024-12-31',
		description: 'endDate, format(YYYY-MM-DD)'
	})
	@IsOptional()
	@IsDateString()
	endDate?: string
}
