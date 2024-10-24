import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
	@ApiProperty({
		example: 'Electronics',
		description: 'The name of the category. This field is required.'
	})
	@IsNotEmpty()
	@IsString()
	name: string;

	@ApiPropertyOptional({
		example: 'Category for all electronic items',
		description: 'A brief description of the category.'
	})
	@IsOptional()
	@IsString()
	description: string;
}
