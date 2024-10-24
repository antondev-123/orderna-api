import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { BasePaginationDto } from "../../../common/dtos/base-pagination.dto";
import { BaseDynamicPeriodFilterDto } from "../../../common/dtos/filters/base-dynamic-period.filter.dto";
import { IsNotEmpty } from "class-validator";

export class AverageOrderFilterDto extends IntersectionType(BasePaginationDto, BaseDynamicPeriodFilterDto) {
	@ApiProperty({
		example: 1,
		description: "The ID of the store to filter store average order summary by.",
	})
	@IsNotEmpty()
	storeId: number;
}
