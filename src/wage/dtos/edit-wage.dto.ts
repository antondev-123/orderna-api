import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class EditWageDto {
    @ApiPropertyOptional()
    @IsNumber()
    @Transform(({ value }) => parseFloat(value))
    ratePerHour: number;


    @ApiPropertyOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    attendanceId: number;

    @ApiPropertyOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    userId: number;

}
