import { IntersectionType } from "@nestjs/swagger";
import { BasePaginationDto } from "src/common/dtos/base-pagination.dto";
import { BaseDynamicPeriodFilterDto } from "src/common/dtos/filters/base-dynamic-period.filter.dto";
import { BaseStoreFilterDto } from "src/common/dtos/filters/base-store.filter.dto";

export class AnalyticsFilterDto extends IntersectionType(BaseStoreFilterDto, BaseDynamicPeriodFilterDto, BasePaginationDto) {
}