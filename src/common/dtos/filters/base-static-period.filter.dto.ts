import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { FilterPeriod } from "../../constants";

export class BaseStaticPeriodFilterDto {
	@ApiPropertyOptional({
		example: FilterPeriod.TODAY,
		description: "Filter by date, values: alltime, today, last7days, lastmonth, lastyear",
		enum: FilterPeriod,
	})
	@IsOptional()
	@IsEnum(FilterPeriod)
	period?: FilterPeriod;
}
