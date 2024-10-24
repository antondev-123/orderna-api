import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsNumber } from "class-validator";
import { IsValidDateString } from "src/common/validations/validation.filter";

export class AllTransactionsResultDto {
    @ApiProperty()
    @IsValidDateString()
    @Transform(({ value }) => value || new Date().toISOString())
    date: Date;

    payment
    status
    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    revenue: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    costOfGoodsSold: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    grossProfit: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    fees: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    tips: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    tax: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    refunds: number;
}