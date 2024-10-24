import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, ValidateNested } from "class-validator";
import { IsValidDateString } from "src/common/validations/validation.filter";

export class DailySummaryResultDto {
    //Individual entries
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1, { message: 'At least one element is required in item' })
    @ValidateNested({ each: true })
    @Type(() => DailyEntryDto)
    dailySummaryEntries: DailyEntryDto[];

    //Summary
    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    aggregateTransactionCount: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    aggregateRevenue: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    aggregateCostOfGoodsSold: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    aggregateGrossProfit: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    aggregateFees: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    aggregateTipsCount: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    aggregateTips: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    aggregateRefundsCount: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    aggregateRefunds: number;
}

export class DailyEntryDto {
    @ApiProperty()
    @IsValidDateString()
    @Transform(({ value }) => value || new Date().toISOString())
    date: Date;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    transactionCount: number;

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
    tipCount: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    tips: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    refundCount: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    refunds: number;
}