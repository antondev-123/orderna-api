import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";
import { COUNTRY_CODE_REGEX, MOBILE_NUMBER_REGEX } from "../../constants/contact-number-regex.constant";

export class BaseMobileNumberDto {
    @ApiProperty({
        description: `The country code of the mobile number. Must include the leading plus sign (+) followed by the country code, which should be a numeric string.`,
        example: '+63',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(COUNTRY_CODE_REGEX, { message: "Invalid country code. Please use a valid format (e.g., +63 for the Philippines)." })
    readonly countryCode: string;

    @ApiProperty({
        description: `The mobile number, excluding the country code. This should be a 10-digit numeric string.`,
        example: '9876543210',
    })
    @IsNotEmpty()
    @IsString()
    @Matches(MOBILE_NUMBER_REGEX, { message: 'Mobile number should be a 10-digit numeric string' })
    readonly number: string;
}
