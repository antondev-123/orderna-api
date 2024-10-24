import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateWageDto {
    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    ratePerHour: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    attendanceId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => parseInt(value))
    userId: number;

}
