import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { BaseStaticPeriodFilterDto } from "../../common/dtos/filters/base-static-period.filter.dto";
import { IsNotEmpty } from "class-validator";

export class CompareStoresDto extends IntersectionType(BaseStaticPeriodFilterDto) {
	@ApiProperty({
		example: 1,
		description: "The ID of the store to filter by.",
	})
	@IsNotEmpty()
	baseStoreId: number;

	@ApiPropertyOptional({
		example: [1, 2],
		description: "The ID of the store to filter by.",
		type: [Number],
	})
	@IsNotEmpty()
	storeId?: number[];
}
