import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Matches } from "class-validator";
import { COUNTRY_CODE_REGEX, TELEPHONE_NUMBER_REGEX } from "../../constants/contact-number-regex.constant";
import { Transform } from "class-transformer";

export class BaseTelephoneNumberDto {
    @ApiProperty({
        description: `The country code of the telephone number. Must include the leading plus sign (+) followed by the country code, which should be a numeric string.`,
        example: '+63',
    })
    @IsNotEmpty()
    @Matches(COUNTRY_CODE_REGEX, { message: "Invalid country code. Please use a valid format (e.g., +63 for the Philippines)." })
    readonly countryCode: string;

    @ApiProperty({
        description: `The telephone number, excluding the country code. This should be a 9-digit numeric string.`,
        example: '123456789',
    })
    @IsNotEmpty()
    @Matches(TELEPHONE_NUMBER_REGEX, { message: 'Telephone number should be a 9-digit numeric string' })
    readonly number: string;
}