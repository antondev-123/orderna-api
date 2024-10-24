import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CategoryIdDto {
	@ApiProperty({
		example: 1,
		description: 'The unique identifier of the category. This field is required.'
	})
	@IsNotEmpty()
	categoryId: number;
}
