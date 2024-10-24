import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ModifierGroupsIdDto {
	@ApiProperty({
		example: 1,
		description:
			"The unique identifier of the modifier group. This field is required.",
	})
	@IsNotEmpty()
	modifierId: number;
}
