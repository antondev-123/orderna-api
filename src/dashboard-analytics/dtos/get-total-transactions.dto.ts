import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { BaseStaticPeriodFilterDto } from "../../common/dtos/filters/base-static-period.filter.dto";
import { IsNotEmpty } from "class-validator";

export class GetTotalTransactionsDto extends IntersectionType(BaseStaticPeriodFilterDto) {
	@ApiProperty({
		example: 1,
		description: "The ID of the store by.",
	})
	@IsNotEmpty()
	storeId: number;
}
