import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateBreakDto {
    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    start: Date;

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    end: Date;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    attendanceId: number;

}
