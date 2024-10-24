import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested } from "class-validator";
import { BaseMobileNumberDto } from "./base-mobile-number.dto";
import { BaseTelephoneNumberDto } from "./base-telephone-number.dto";

export class BaseContactNumbersDto {
    @ApiProperty({
        type: BaseMobileNumberDto,
        description: `The mobile number. Must be an object with 'countryCode' (e.g., '+63') and a 10-digit 'number'.`,
    })
    @IsNotEmpty()
    @Type(() => BaseMobileNumberDto)
    @ValidateNested()
    readonly mobile: BaseMobileNumberDto;

    @ApiProperty({
        type: BaseTelephoneNumberDto,
        description: `The telephone number. Must be an object with 'countryCode' (e.g., '+63') and a 9-digit 'number'.`,
    })
    @IsNotEmpty()
    @Type(() => BaseTelephoneNumberDto)
    @ValidateNested()
    readonly telephone: BaseTelephoneNumberDto;
}