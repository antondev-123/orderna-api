import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CloseRegisterDto {
	@ApiProperty({
		example: "2023-01-01 10:00 AM",
		description: "The date and time when the register was closed."
	})
	@Transform(({ value }) => new Date(value))
	@IsNotEmpty()
	closed: string;

	@ApiPropertyOptional({
		example: "Register closed for the morning shift",
		description: "An optional note about the closure of the register."
	})
	@IsString()
	@IsOptional()
	closeNote?: string;

	@ApiProperty({
		example: 100.0,
		description: "The amount of money counted when the register was closed."
	})
	@Type(() => Number)
	@IsNumber()
	@IsNotEmpty()
	counted: number;
}
