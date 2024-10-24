import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ProductIdDto {
	@ApiProperty({
		example: 2,
		description: 'The unique identifier of the product. This field is required.'
	})
	@IsNotEmpty()
	productId: number;
}
