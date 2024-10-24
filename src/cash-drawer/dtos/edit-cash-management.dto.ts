import { ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsNumber,
	IsOptional,
	IsString
} from "class-validator";

export class EditCashManagementDto {
	@ApiPropertyOptional({
		description: "Amount of cash in",
		example: 100.5,
	})
	@IsOptional()
	@IsNumber()
	cashIn?: number;

	@ApiPropertyOptional({
		description: "Amount of cash out",
		example: 50.75,
	})
	@IsOptional()
	@IsNumber()
	cashOut?: number;

	@ApiPropertyOptional({
		description: "Additional notes",
		example: "This is a note for the cash management entry.",
	})
	@IsOptional()
	@IsString()
	note?: string;

	@ApiPropertyOptional({
		description: "Indicates if this is an expense",
		example: "true",
	})
	@IsOptional()
	@IsString()
	isExpense?: string;
}
