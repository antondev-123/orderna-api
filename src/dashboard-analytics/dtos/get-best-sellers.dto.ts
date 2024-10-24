import { ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { BaseStaticPeriodFilterDto } from "../../common/dtos/filters/base-static-period.filter.dto";
import { BaseSortOrderDto } from "../../common/dtos/base-sort-order.dto";

export class GetBestSellersDto extends IntersectionType(BaseStaticPeriodFilterDto, BaseSortOrderDto) {
	@ApiPropertyOptional({
		example: 1,
		description: "The ID of the store to filter by.",
	})
	@IsOptional()
	storeId?: number;
}
