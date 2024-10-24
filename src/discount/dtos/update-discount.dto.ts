import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDateString, IsEmpty, IsEnum, IsNumber, IsString, Max, Min } from "class-validator";
import { DiscountType } from "../enums/discount-type.enum";
import { DiscountStatus } from "../enums/discount-status.enum";

export class UpdateDiscountDto {
    @IsEmpty()
    discountId?: number

    @ApiProperty({
        description: 'Code of the discount, must be unique.',
        type: String,
        example: "CODE123"
    })
    @IsString()
    discountCode: string

    @ApiProperty({
        description: 'Name of the discount.',
        type: String,
        example: "Happy Days"
    })
    @IsString()
    discountName: string

    @ApiProperty({
        description: 'StoreIds of the discount, from table stores',
        type: Array,
        example: [1, 2, 3, 4]
    })
    @IsArray()
    storeIds: number[]

    @ApiProperty({
        description: 'Type of the discount',
        enum: DiscountType
    })
    @IsEnum([DiscountType.TOTAL_DISCOUNT, DiscountType.ALL_ITEMS, DiscountType.ONE_ITEM], {
        message: `Type need to be either: ${[DiscountType.TOTAL_DISCOUNT, DiscountType.ALL_ITEMS, DiscountType.ONE_ITEM]}`
    })
    discountType: DiscountType

    @ApiProperty({
        description: 'Value of the discount as a percentage',
        type: Number,
        minimum: 1,
        maximum: 100,
        example: 20
    })
    @Min(1)
    @Max(100)
    @IsNumber()
    discountValue: number

    @ApiProperty({
        description: 'Status of the discount',
        enum: DiscountStatus
    })
    @IsEnum([DiscountStatus.ACTIVE, DiscountStatus.EXPIRED], {
        message: `Status need to be either: ${[DiscountStatus.ACTIVE, DiscountStatus.EXPIRED]}`
    })
    discountStatus: DiscountStatus

    @ApiProperty({
        description: 'Start datetime of the discount, format YYYY-MM-DDTHH:mm:ssZ (ISO 8601)',
        type: String,
        example: '2024-07-19T07:00:00+07:00'
    })
    @IsDateString()
    startDate: string

    @ApiProperty({
        description: 'End datetime of the discount, format YYYY-MM-DDTHH:mm:ssZ (ISO 8601)',
        type: String,
        example: '2024-07-19T16:00:00+07:00'
    })
    @IsDateString()
    endDate: string

    @ApiProperty({
        description: 'Minimum spend of the discount',
        type: Number,
        example: 10
    })
    @IsNumber()
    minimumSpend: number

    @ApiProperty({
        description: 'Redemption limit for overall of the discount',
        type: Number,
        example: 50
    })
    @IsNumber()
    limitOverall: number

    @ApiProperty({
        description: 'Redemption limit per customer of the discount',
        type: Number,
        example: 5
    })
    @IsNumber()
    limitCustomer: number
}