import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RefundItemsDto {
	@ApiProperty({
		description: "Product ID",
		example: 1,
	})
	@IsNotEmpty()
	productId: number;

	@ApiProperty({
		description: "Quantity",
		example: 1,
	})
	@IsNotEmpty()
	quantity: number;
}
