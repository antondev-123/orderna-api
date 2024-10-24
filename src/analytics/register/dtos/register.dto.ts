import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { BaseDynamicPeriodFilterDto } from "../../../common/dtos/filters/base-dynamic-period.filter.dto";
import { BasePaginationDto } from "../../../common/dtos/base-pagination.dto";

export class RegisterDto extends IntersectionType(BasePaginationDto, BaseDynamicPeriodFilterDto) {
	@ApiProperty({
		example: 1,
		description: "The ID of the store to filter store register summary by.",
	})
	@IsNotEmpty()
	storeId: number;
}
