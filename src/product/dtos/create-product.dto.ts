import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
	@ApiProperty({
		example: 'Product1',
		description: 'The title or name of the product.'
	})
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiProperty({
		example: 200,
		description: 'The cost price of the product.'
	})
	@IsNotEmpty()
	cost: number;

	@ApiProperty({
		example: 300,
		description: 'The selling price of the product.'
	})
	@IsNotEmpty()
	price: number;

	@ApiProperty({
		example: 50.12,
		description: 'The unit measurement of the product.'
	})
	@IsNotEmpty()
	unit: number;

	@ApiPropertyOptional({
		example: 500,
		description: 'The stock quantity of the product.'
	})
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => parseInt(value))
	stock?: number;

	@ApiPropertyOptional({
		example: 'plu',
		description: 'The SKU/PLU code of the product for inventory tracking.'
	})
	@IsOptional()
	@IsString()
	sk_plu?: string;

	@ApiPropertyOptional({
		example: 'product is good',
		description: 'A brief description of the product.'
	})
	@IsOptional()
	@IsString()
	description: string;

	@ApiPropertyOptional({
		example: 2,
		description: 'The category ID the product belongs to.'
	})
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => parseInt(value))
	category?: number;

	@ApiProperty({
		example: 1,
		description: 'The ID of the store that the product belongs to.'
	})
	@IsNotEmpty()
	store: number;

	@ApiPropertyOptional({
		example: 'image.png',
		description: 'Optional image of the product, can be any type.'
	})
	@IsOptional()
	image: any;
}
