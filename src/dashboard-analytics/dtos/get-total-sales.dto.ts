import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { BaseStaticPeriodFilterDto } from "../../common/dtos/filters/base-static-period.filter.dto";

export class GetTotalSalesDto extends IntersectionType(BaseStaticPeriodFilterDto) {
	@ApiProperty({
		description: "Store ID to filter the sales",
		example: 1,
		type: Number,
	})
	@IsNotEmpty()
	storeId: number;
}
