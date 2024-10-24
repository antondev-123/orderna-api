import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class WageIdDto {
    @ApiProperty()
    @IsNotEmpty()
    wageId: number;
}
