import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class TransactionIdDto {
    @ApiProperty({
        example: 1,
        description: 'The unique identifier of the transaction. This field is required.'
    })
    @IsNotEmpty()
    transactionId: number;
}
