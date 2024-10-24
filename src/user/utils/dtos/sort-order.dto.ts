import { IsEnum, IsOptional } from "class-validator";
import { SortOrder } from "src/common/constants/enums/sort-order.enum";

export class SortOrderDto {
	@IsOptional()
	@IsEnum(SortOrder)
	sortOrder?: SortOrder;
}
