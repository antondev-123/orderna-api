import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { BaseMobileNumberDto } from "src/common/dtos/contact-numbers/base-mobile-number.dto";
import { BaseTelephoneNumberDto } from "src/common/dtos/contact-numbers/base-telephone-number.dto";
import { IsValidDateString } from "src/common/validations/validation.filter";

export class EditCustomerDto {
	@ApiPropertyOptional({
		example: 1,
		description: 'The ID of the store the customer is associated with.'
	})
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	store?: number;

	@ApiPropertyOptional({
		example: 'John',
		description: 'The first name of the customer.'
	})
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({
		example: 'Doe',
		description: 'The last name of the customer.'
	})
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiPropertyOptional({
		example: 'Doe Enterprises',
		description: 'The company name of the customer, if applicable.'
	})
	@IsOptional()
	@IsString()
	company?: string;

	@ApiPropertyOptional({
		example: '12345',
		description: 'The postal code of the customer\'s address.'
	})
	@IsOptional()
	@IsNumber()
	zipCode?: number;

	@ApiPropertyOptional({
		example: 'New York',
		description: 'The city where the customer resides.'
	})
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({
		example: '123 Elm Street',
		description: 'The street address of the customer.'
	})
	@IsOptional()
	@IsString()
	street?: string;

	@ApiPropertyOptional({
		type: BaseMobileNumberDto,
		description: `The customer's mobile number.`,
	})
	@IsOptional()
	@ValidateNested()
	mobile?: BaseMobileNumberDto;

	@ApiPropertyOptional({
		type: BaseTelephoneNumberDto,
		description: `The customer's telephone number.`,
	})
	@IsOptional()
	@ValidateNested()
	telephone?: BaseTelephoneNumberDto;

	@ApiPropertyOptional({
		example: 'john.doe@example.com',
		description: 'The email address of the customer.'
	})
	@IsOptional()
	@IsString()
	email?: string;

	@ApiPropertyOptional({
		example: '1990-01-01',
		description: 'The birthday of the customer, in the format YYYY-MM-DD.'
	})
	@IsOptional()
	@IsValidDateString()
	birthday?: Date;

	@ApiPropertyOptional({
		example: 'Preferred customer with special discount.',
		description: 'Additional notes about the customer.'
	})
	@IsOptional()
	@IsString()
	note?: string;
}
