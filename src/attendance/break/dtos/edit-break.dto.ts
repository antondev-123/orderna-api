import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber } from "class-validator";

export class EditBreakDto {
    @ApiPropertyOptional()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    start: Date;

    @ApiPropertyOptional()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    end: Date;

    @ApiPropertyOptional()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    attendanceId: number;

}
