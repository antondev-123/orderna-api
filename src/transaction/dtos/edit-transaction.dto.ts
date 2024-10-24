import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { PaymentType } from "src/common/constants/enums/payment-type.enum";
import { TransactionStatus } from "src/common/constants/enums/transaction-status.enum";
import { TransactionType } from "src/common/constants/enums/transaction-type.enum";
import { IsValidDateString } from "src/common/validations/validation.filter";

export class EditTransactionDto {
	@ApiPropertyOptional({
		example: 5,
		description: 'The ID of the customer involved in the transaction.'
	})
	@IsOptional()
	@IsNumber()
	customer?: number;

	@ApiPropertyOptional({
		example: 1,
		description: 'The ID of the store where the transaction took place.'
	})
	@IsOptional()
	@IsNumber()
	store?: number;

	@ApiPropertyOptional({
		example: 1,
		description: 'The ID of the staff who handled the transaction.'
	})
	@IsOptional()
	@IsNumber()
	staff?: number;

	@ApiPropertyOptional({
		example: 50000,
		description: 'The service charge rate applied to the transaction, in cents.'
	})
	@IsOptional()
	serviceChargeRate?: number;

	@ApiPropertyOptional({
		example: 50,
		description: 'The tip amount given in the transaction.'
	})
	@IsOptional()
	tip?: number;

	@ApiPropertyOptional({
		example: 500,
		description: 'The sales tax rate applied to the transaction, in percentage.'
	})
	@IsOptional()
	salesTaxRate?: number;

	@ApiPropertyOptional({
		example: PaymentType.CASH,
		enum: PaymentType,
		description: 'The type of payment used in the transaction.'
	})
	@IsOptional()
	@IsEnum(PaymentType)
	paymentType?: PaymentType;

	@ApiPropertyOptional({
		example: TransactionStatus.APPROVED,
		enum: TransactionStatus,
		description: 'The status of the transaction.'
	})
	@IsOptional()
	@IsEnum(TransactionStatus)
	status?: TransactionStatus;

	@ApiPropertyOptional({
		example: TransactionType.COUNTER,
		enum: TransactionType,
		description: 'The type of transaction (e.g., counter, online).'
	})
	@IsOptional()
	@IsEnum(TransactionType)
	type?: TransactionType;

	@ApiPropertyOptional({
		example: '2024-06-01',
		description: 'The date the transaction occurred.'
	})
	@IsOptional()
	@IsValidDateString()
	transactionDate?: Date;

	@ApiPropertyOptional({
		example: 'Transaction 1',
		description: 'Any additional notes regarding the transaction.'
	})
	@IsOptional()
	@IsString()
	note?: string;

	@ApiPropertyOptional({
		example: [
			{
				"transactionItemId": 7,
				"product": 1,
				"quantity": 2,
				"isRefund": true
			}
		],
		description: 'The list of items involved in the transaction.'
	})
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => EditTransactionItemDto)
	item?: EditTransactionItemDto[];

	@ApiPropertyOptional({
		example: ['4'],
		description: 'List of transaction item IDs to be deleted.'
	})
	@IsOptional()
	@IsArray()
	deleteItem?: string;

}

export class EditTransactionItemDto {
	@ApiProperty({
		example: 7,
		description: 'The ID of the transaction item.'
	})
	@IsNotEmpty()
	transactionItemId: number;

	@ApiPropertyOptional({
		example: 1,
		description: 'The ID of the product in the transaction item.'
	})
	@IsOptional()
	product?: number;

	@ApiPropertyOptional({
		example: 2,
		description: 'The quantity of the product in the transaction item.'
	})
	@IsOptional()
	@IsNumber()
	quantity?: number;

	@ApiPropertyOptional({
		example: true,
		description: 'Indicates whether the transaction item is a refund.'
	})
	@IsOptional()
	@IsBoolean()
	isRefund?: boolean;
}


