import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CustomerIdDto {
	@ApiProperty({
		example: 1,
		description: 'The unique identifier of the customer. This field is required.'
	})
	@IsNotEmpty()
	customerId: number;
}
