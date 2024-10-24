import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";


export class CreateAttendanceDto {
	@ApiProperty({
		example: "2024-01-01T08:00:00Z",
		description: "The date and time when the user clocked in",
	})
	@IsNotEmpty()
	@Transform(({ value }) => new Date(value))
	clockIn: Date;

	@ApiPropertyOptional({
		example: "2024-01-01T17:00:00Z",
		description: "The date and time when the user clocked out",
	})
	@IsOptional()
	@Transform(({ value }) => new Date(value))
	clockOut: Date;

	@ApiProperty({
		type: 'string',
		format: 'binary',
		description: "The image of user clocked in",
	})
	clockInImageUrl: any;

	@ApiPropertyOptional({
		type: 'string',
		format: 'binary',
		description: "The image of user clocked out",
	})
	@IsOptional()
	clockOutImageUrl: any;

	@ApiProperty({
		example: 1,
		description: "The ID of the user",
	})
	@IsNotEmpty()
	@IsNumber()
	@Transform(({ value }) => parseInt(value))
	userId: number;

	@ApiProperty({
		example: 1,
		description: "The ID of the store",
	})
	@IsNotEmpty()
	@IsNumber()
	@Transform(({ value }) => parseInt(value))
	storeId: number;
}
