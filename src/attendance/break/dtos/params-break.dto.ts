import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class BreakIdDto {
    @ApiProperty()
    @IsNotEmpty()
    breakId: number;
}
