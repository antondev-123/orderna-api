import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { FilterPeriod } from "src/common/constants/enums/filter-period.enum";

export class FilterAttendanceDto {
	@ApiPropertyOptional({
		example: FilterPeriod.TODAY,
		description: "The period for filtering attendance data",
		enum: FilterPeriod,
	})
	@IsOptional()
	@IsEnum(FilterPeriod)
	period?: FilterPeriod;

	@ApiPropertyOptional({
		example: 1,
		description: "The ID of the store",
	})
	@IsOptional()
	storeId?: number;

	@ApiPropertyOptional({
		example: "John",
		description: "The name to filter by first_name in general_info entity",
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		example: 50,
		description: "The maximum number of records to return",
	})
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsNumber()
	limit?: number;

	@ApiPropertyOptional({
		example: 1,
		description: "The page number to return",
	})
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsNumber()
	page?: number = 1;
}
