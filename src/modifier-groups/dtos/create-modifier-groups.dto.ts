import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";
import { MaxOptions } from "src/common/validations/validation.filter";

export class CreateOptionsDto {
	@ApiProperty({
		example: 300,
		description: "The selling price of the options.This field is required.",
	})
	@IsNotEmpty()
	price: number;

	@ApiProperty({
		example: 1,
		description: "The product ID the product belongs to.",
	})
	@IsNotEmpty()
	@IsNumber()
	product: number;
}

export class CreateModifierGroupDto {
	@ApiProperty({
		example: "Title1",
		description: "The title of the modifier. This field is required.",
	})
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiPropertyOptional({
		example: "plu",
		description: "The SKU/PLU code of the product for modifier group.",
	})
	@IsOptional()
	@IsString()
	sku_plu?: string;

	@ApiPropertyOptional({
		example: "Description of all category",
		description: "A brief description of the category.",
	})
	@IsOptional()
	@IsString()
	description: string;

	@ApiProperty({
		type: Number,
		example: 2,
		description: "The limits of options.",
	})
	@IsNumber()
	@Transform(({ value }) => parseInt(value))
	limit: number;

	@ApiProperty({
		type: String,
		isArray: true,
		example: ["2", "1"],
		description: "The category ID the product belongs to.",
	})
	@IsNotEmpty()
	@IsArray()
	@ArrayMinSize(1, { message: "At least one element is required in categories" })
	@IsString({ each: true })
	category: string[];

	@ApiProperty({
		type: CreateOptionsDto,
		isArray: true,
		example: [
			{ product: 1, price: 234 },
			{ product: 2, price: 11 },
		],
		description: "The list of items involved in the transaction.",
	})
	@IsNotEmpty({ message: "Options array cannot be empty" })
	@IsArray({ message: "Options must be an array" })
	@ArrayMinSize(1, { message: "At least one element is required in options" })
	@MaxOptions({ message: "Number of options exceeds the limit." })
	@ValidateNested({ each: true })
	@Type(() => CreateOptionsDto)
	options: CreateOptionsDto[];
}