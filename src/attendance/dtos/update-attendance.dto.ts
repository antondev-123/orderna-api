import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateAttendanceDto {
	@ApiPropertyOptional({
		example: "2024-01-01T08:00:00Z",
		description: "The date and time when the user clocked in",
	})
	@IsOptional()
	clockIn: Date;

	@ApiPropertyOptional({
		example: "2024-01-01T17:00:00Z",
		description: "The date and time when the user clocked out",
	})
	@IsOptional()
	clockOut: Date;

	@ApiPropertyOptional({
		type: 'string',
		format: 'binary',
		description: "The image of user clocked in",
	})
	@IsOptional()
	@IsString()
	clockInImageUrl: string;

	@ApiPropertyOptional({
		type: 'string',
		format: 'binary',
		description: "The image of user clocked out",
	})
	@IsOptional()
	@IsString()
	clockOutImageUrl: string;

	@ApiPropertyOptional({
		example: 1,
		description: "The ID of the user",
	})
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => parseInt(value))
	userId: number;

	@ApiPropertyOptional({
		example: 1,
		description: "The ID of the store",
	})
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => parseInt(value))
	storeId: number;
}
