import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsNumber, IsString } from "class-validator";

export class CreateDiscountTransactionDto {
    @IsEmpty()
    discountTransactionId?: number

    @ApiProperty({
        description: 'transactionId from table transactions',
        type: Number,
        example: 1
    })
    @IsNumber()
    transactionId: number

    @ApiProperty({
        description: 'discountCode from table discounts',
        type: String,
        example: 'CODE123'
    })
    @IsString()
    discountCode: string

    @ApiProperty({
        description: 'storeId from table stores',
        type: Number,
        example: 1
    })
    @IsNumber()
    storeId: number

    @ApiProperty({
        description: 'customerId from table stores',
        type: Number,
        example: 1
    })
    @IsNumber()
    customerId: number

    @ApiProperty({
        description: 'amount from table transactions',
        type: Number,
        example: 1
    })
    @IsNumber()
    amount: number
}