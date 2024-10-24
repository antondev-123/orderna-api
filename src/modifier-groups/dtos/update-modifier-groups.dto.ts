import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";
import { MaxOptions } from "src/common/validations/validation.filter";

export class EditModifierGroupDto {
	@ApiPropertyOptional({
		example: "Title1",
		description: "The title of the modifier",
	})
	@IsOptional()
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

	@ApiPropertyOptional({
		example: 2,
		description: "The limits of options.",
	})
	@IsOptional()
	limit: number;

	@ApiPropertyOptional({
		example: ["2", "1"],
		description: "The category ID the product belongs to.",
	})
	@IsOptional()
	@IsString({ each: true })
	category: string[];

	@ApiPropertyOptional({
		example: [
			{ optionId: 1, price: 234, product: 2 },
			{ optionId: 2, price: 11, product: 1 }
		],
		description: "The list of items involved in the transaction.",
	})
	@IsOptional()
	@MaxOptions({ message: "Number of options exceeds the limit." })
	@ValidateNested({ each: true })
	@Type(() => OptionsDto)
	options: OptionsDto[];
}

export class OptionsDto {
	@ApiPropertyOptional({
		example: 1,
		description: "The ID of the option.",
	})
	@IsOptional()
	optionId: number;

	@ApiPropertyOptional({
		example: 300,
		description: "The selling price of the options.",
	})
	@IsOptional()
	price: number;

	@ApiPropertyOptional({
		example: 1,
		description: "The product ID the product belongs to.",
	})
	@IsOptional()
	@IsNumber()
	product: number;
}
