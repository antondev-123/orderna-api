import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class EditCategoryDto {
	@ApiPropertyOptional({
		example: 'Electronics',
		description: 'The updated name of the category.'
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		example: 'Category for all electronic items',
		description: 'An updated brief description of the category.'
	})
	@IsOptional()
	@IsString()
	description?: string;
}
