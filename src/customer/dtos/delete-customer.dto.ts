import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

export class DeleteCustomerDto {
	@ApiProperty({
		example: [1, 2, 3],
		description: 'An array of customer IDs to be deleted.'
	})
	@IsArray()
	customerIds: number[];
}
