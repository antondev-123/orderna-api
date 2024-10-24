
import { ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { IsEnum, IsIn, IsOptional, IsString } from "class-validator";
import { PaymentType, UserStatus } from "src/common/constants";
import { BasePaginationDto } from "src/common/dtos/base-pagination.dto";
import { BaseSortOrderDto } from "src/common/dtos/base-sort-order.dto";
import { BaseStaticPeriodFilterDto } from "src/common/dtos/filters/base-static-period.filter.dto";
import { BaseStoreFilterDto } from "src/common/dtos/filters/base-store.filter.dto";
import { BaseFilterDto } from "src/common/dtos/filters/base.filter.dto";
import { getEntityColumns } from "src/common/utils/entity.util";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { SupplierEntity } from "../supplier.entity";

export class FilterSupplierDto extends IntersectionType(
    BaseFilterDto,
    BaseStaticPeriodFilterDto,
    BaseStoreFilterDto,
    BasePaginationDto,
    BaseSortOrderDto) {

    @ApiPropertyOptional({
        example: null,
        description: `The field to sort by. Must be one of: ${getEntityColumns(
            [SupplierEntity, ContactInformationEntity],
        ).join(", ")}`,
        nullable: true
    })
    @IsOptional()
    @IsString()
    @IsIn(getEntityColumns([SupplierEntity, , ContactInformationEntity]))
    sortBy?: string;

    @ApiPropertyOptional({
        example: null,
        description: 'Status of the supplier to filter by',
        enum: UserStatus,
        nullable: true
    })
    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @ApiPropertyOptional({
        example: null,
        description: 'Payment type associated with the supplier to filter by',
        enum: PaymentType,
        nullable: true
    })
    @IsOptional()
    @IsEnum(PaymentType)
    paymentType?: PaymentType;
}