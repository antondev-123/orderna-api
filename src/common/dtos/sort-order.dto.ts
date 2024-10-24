import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { SortOrder } from "src/common/constants/enums/sort-order.enum";

export class SortOrderDto {
	@ApiPropertyOptional({
		example: SortOrder.ASC,
		enum: SortOrder,
		description: 'Specifies the order of sorting. Can be "ASC" for ascending or "DESC" for descending order.'
	})
	@IsOptional()
	@IsEnum(SortOrder)
	sortOrder?: SortOrder;
}
