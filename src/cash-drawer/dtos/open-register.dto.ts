import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class OpenRegisterDto {
	@ApiProperty({
		example: "1",
		description: "The ID of the store where the register is being opened.",
	})
	@IsNotEmpty()
	storeId: string;

	@ApiProperty({
		example: "2023-01-01 10:00 AM",
		description: "The date and time when the register was opened.",
	})
	@Transform(({ value }) => new Date(value))
	@IsNotEmpty()
	opened: string;

	@ApiProperty({
		example: 100,
		description: "The initial amount of money in the register when it was opened.",
	})
	@IsNumber()
	@IsNotEmpty()
	@Transform(({ value }) => parseFloat(value))
	amount: number;

	@ApiPropertyOptional({
		example: "Register opened for the morning shift",
		description: "An optional note about the opening of the register.",
	})
	@IsString()
	@IsOptional()
	openNote?: string;
}
