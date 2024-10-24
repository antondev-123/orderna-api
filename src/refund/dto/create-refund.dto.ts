import { ApiProperty } from "@nestjs/swagger";
import { IsArray, isArray, IsNotEmpty, ValidateNested } from "class-validator";
import { RefundItemsDto } from "./refund-items.dto";
import { Type } from "class-transformer";

export class CreateRefundDto {
	@ApiProperty({
		description: "Transaction ID",
		example: 1,
	})
	@IsNotEmpty()
	transactionId: number;

	@ApiProperty({
		description: "Refund Reason",
		example: "Product is not as expected",
	})
	@IsNotEmpty()
	refundReason: string;

	@ApiProperty({
		description: "Item product id",
		type: [RefundItemsDto],
	})
	@IsNotEmpty()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => RefundItemsDto)
	items: RefundItemsDto[];
}
