import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class EditProductDto {
	@ApiPropertyOptional({
		example: 'Product1',
		description: 'The title or name of the product.'
	})
	@IsOptional()
	@IsString()
	title?: string;

	@ApiPropertyOptional({
		example: 2000,
		description: 'The cost price of the product.'
	})
	@IsOptional()
	@IsNumber()
	cost?: number;

	@ApiPropertyOptional({
		example: 100,
		description: 'The selling price of the product.'
	})
	@IsOptional()
	@IsNumber()
	price?: number;

	@ApiPropertyOptional({
		example: 50.12,
		description: 'The unit measurement of the product.'
	})
	@IsOptional()
	@IsNumber()
	unit?: number;

	@ApiPropertyOptional({
		example: 500,
		description: 'The stock quantity of the product.'
	})
	@IsOptional()
	@IsNumber()
	stock?: number;

	@ApiPropertyOptional({
		example: 'plu',
		description: 'The SKU/PLU code of the product for inventory tracking.'
	})
	@IsOptional()
	@IsString()
	sk_plu?: string;

	@ApiPropertyOptional({
		example: 'A great product for daily use.',
		description: 'A brief description of the product.'
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		example: 'https://example.com/product',
		description: 'The URL for more information about the product.'
	})
	@IsOptional()
	@IsString()
	url?: string;

	@ApiPropertyOptional({
		example: 1,
		description: 'The category ID the product belongs to.'
	})
	@IsOptional()
	@IsNumber()
	category?: number;

	@ApiPropertyOptional({
		example: 1,
		description: 'The ID of the store that the product belongs to.'
	})
	@IsOptional()
	@IsNumber()
	store?: number;
}
