import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { BasePaginationDto } from "src/common/dtos/base-pagination.dto";
import { BaseDynamicPeriodFilterDto } from "src/common/dtos/filters/base-dynamic-period.filter.dto";

export class RevenueFilterDto extends IntersectionType(BasePaginationDto, BaseDynamicPeriodFilterDto) {
	@ApiProperty({
		example: 1,
		description: "The ID of the store to filter store",
	})
	@IsNotEmpty()
	storeId: number;
}
