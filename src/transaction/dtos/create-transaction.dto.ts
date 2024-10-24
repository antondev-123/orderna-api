import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { PaymentType } from "src/common/constants/enums/payment-type.enum";
import { TransactionStatus } from "src/common/constants/enums/transaction-status.enum";
import { TransactionType } from "src/common/constants/enums/transaction-type.enum";
import { IsValidDateString } from "src/common/validations/validation.filter";

export class CreateTransactionItemDto {
	@ApiProperty({
		example: 1,
		description: 'The ID of the product involved in the transaction.'
	})
	@IsNotEmpty()
	product: number;

	@ApiProperty({
		example: 2,
		description: 'The quantity of the product in the transaction.'
	})
	@IsNotEmpty()
	@IsNumber()
	quantity: number

	@ApiPropertyOptional({
		example: 20,
		description: 'The discount to be applied to the transaction item.'
	})
	@IsOptional()
	@IsNumber()
	discountValue?: number;

	@ApiProperty({
		example: true,
		description: 'Indicates whether the item is a refund.'
	})
	@IsNotEmpty()
	@IsBoolean()
	isRefund: boolean
}

export class CreateTransactionDto {
	@ApiPropertyOptional({
		example: 2,
		description: 'The ID of the customer involved in the transaction.'
	})
	@IsOptional()
	@IsNumber()
	customer?: number;

	@ApiProperty({
		example: 2,
		description: 'The ID of the store where the transaction took place.'
	})
	@IsNotEmpty()
	@IsNumber()
	store: number;

	@ApiProperty({
		example: 1,
		description: 'The ID of the staff who handled the transaction.'
	})
	@IsNotEmpty()
	@IsNumber()
	staff: number;

	@ApiPropertyOptional({
		example: 10,
		description: 'The service charge rate applied to the transaction, in percentage.'
	})
	@IsOptional()
	serviceChargeRate?: number;

	@ApiPropertyOptional({
		example: 52,
		description: 'The tip amount given in the transaction.'
	})
	@IsOptional()
	tip?: number;

	@ApiProperty({
		example: 12,
		description: 'The sales tax rate applied to the transaction, in percentage.'
	})
	@IsNotEmpty()
	salesTaxRate: number;

	@ApiProperty({
		example: 'cash',
		description: 'The type of payment used in the transaction.',
		enum: PaymentType
	})
	@IsNotEmpty()
	@IsEnum(PaymentType)
	paymentType: PaymentType;

	@ApiProperty({
		example: 'approved',
		description: 'The status of the transaction.',
		enum: TransactionStatus
	})
	@IsNotEmpty()
	@IsEnum(TransactionStatus)
	status: TransactionStatus;

	@ApiProperty({
		example: 'counter',
		description: 'The type of transaction (e.g., counter, online).', enum: TransactionType
	})
	@IsNotEmpty()
	@IsEnum(TransactionType)
	type: TransactionType;

	@ApiProperty({
		example: '2024-07-01',
		description: 'The date the transaction occurred.'
	})
	@IsNotEmpty()
	@IsValidDateString()
	transactionDate: Date;

	@ApiPropertyOptional({
		example: 'Transaction 3',
		description: 'Any additional notes regarding the transaction.'
	})
	@IsOptional()
	@IsString()
	note?: string;

	@ApiProperty({
		example: [
			{ "product": 1, "quantity": 2, "isRefund": true },
			{ "product": 2, "quantity": 1, "isRefund": true }
		],
		description: 'The list of items involved in the transaction.',
		type: [CreateTransactionItemDto],
	})
	@IsNotEmpty()
	@IsArray()
	@ArrayMinSize(1, { message: 'At least one element is required in item' })
	@ValidateNested({ each: true })
	@Type(() => CreateTransactionItemDto)
	item: CreateTransactionItemDto[]
}
