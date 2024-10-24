import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseContactNumbersDto } from "src/common/dtos/contact-numbers/base-contact-numbers.dto";
import { IsValidDateString } from "src/common/validations/validation.filter";

export class CreateCustomerDto extends PartialType(BaseContactNumbersDto) {
	@ApiProperty({
		example: 1,
		description: 'The ID of the store the customer is associated with.'
	})
	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	store: number;

	@ApiProperty({
		example: 'John',
		description: 'The first name of the customer.'
	})
	@IsNotEmpty()
	@IsString()
	firstName: string;

	@ApiProperty({
		example: 'Doe',
		description: 'The last name of the customer.'
	})
	@IsNotEmpty()
	@IsString()
	lastName: string;

	@ApiPropertyOptional({
		example: 'Doe Enterprises',
		description: 'The company name of the customer, if applicable.'
	})
	@IsOptional()
	@IsString()
	company?: string;

	// TODO: Consider making a string
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
