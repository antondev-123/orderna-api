import { IntersectionType } from "@nestjs/swagger";
import { BasePaginationDto } from "../../common/dtos/base-pagination.dto";
import { BaseSortOrderDto } from "../../common/dtos/base-sort-order.dto";

export class FilterRefundDto extends IntersectionType(BasePaginationDto, BaseSortOrderDto) {}
