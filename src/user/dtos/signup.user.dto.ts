import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	IsStrongPassword,
} from "class-validator";
import { BaseContactNumbersDto } from "src/common/dtos/contact-numbers/base-contact-numbers.dto";

export class SignupUserDto extends PartialType(PickType(BaseContactNumbersDto, ['mobile'])) {
	@ApiProperty({
		example: "azc.baltazar@arkconsult.com",
		description: "The email address of the User",
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		example: "daniza_baltazar",
		description: "The username of the User",
	})
	@IsString()
	username: string;

	@ApiProperty({
		example: "$passwordHere$252810",
		description: "A strong password for the User",
	})
	@IsString()
	@IsStrongPassword()
	password: string;

	@ApiProperty({
		example: "daniza",
		description: "The first name of the User",
	})
	@IsString()
	firstName: string;

	@ApiProperty({
		example: "baltazar",
		description: "The last name of the User",
	})
	@IsString()
	lastName: string;
}

export class SigninUserDto {
	@ApiProperty({
		example: "azc.baltazar@arkconsult.com",
		description: "The email address of the User",
	})
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({
		example: "$passwordHere$252810",
		description: "User Password",
	})
	@IsNotEmpty()
	@IsString()
	password: string;
}
