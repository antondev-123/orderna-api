import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";
import { DiscountRangeDate } from "../enums/discount-rangedate.enum";
import { DiscountSortBy } from "../enums/discount-sortby.enum";
import { DiscountStatus } from "../enums/discount-status.enum";

export class FilterDiscountDto {
	@ApiPropertyOptional({
		example: 1,
		description: 'filter by storeId'
	})
	@IsOptional()
	@IsString()
	storeId?: number;

	@ApiPropertyOptional({
		example: 'SUMMER2024',
		description: 'search by name or code discount'
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		example: DiscountRangeDate.TODAY,
		description: 'filter by date, values: alltime, today, last7days, lastmonth, lastyear'
	})
	@IsOptional()
	@IsEnum(DiscountRangeDate)
	date?: DiscountRangeDate;

	@ApiPropertyOptional({
		example: DiscountStatus.ACTIVE,
		description: 'filter by status of discount, values: active, expired, archived, scheduled'
	})
	@IsOptional()
	@IsEnum(DiscountStatus)
	status?: DiscountStatus;

	@ApiPropertyOptional({
		example: DiscountSortBy.DISCOUNT_CODE,
		description: 'filter by status of discount, values: discountCode, discountStatus, totalUsed'
	})
	@IsOptional()
	@IsEnum(DiscountSortBy)
	sortby?: DiscountSortBy;

	@ApiPropertyOptional({
		example: 10,
		description: 'limit part of query, default 10'
	})
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsNumber()
	limit?: number = 10;

	@ApiPropertyOptional({
		example: 1,
		description: 'page part of query, default 1'
	})
	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsNumber()
	page?: number = 1;
}
