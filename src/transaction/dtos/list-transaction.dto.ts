import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import {
	IsEnum,
	IsNotEmpty,
	IsOptional,
} from "class-validator";
import { PaymentType } from "src/common/constants/enums/payment-type.enum";
import { TransactionStatus } from "src/common/constants/enums/transaction-status.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { IsValidDateString } from "src/common/validations/validation.filter";

export class ListTransactionDto extends IntersectionType(PaginationDto) {
	@ApiPropertyOptional({
		example: 'Main Store',
		description: 'The name of the store to filter transactions.'
	})
	@IsOptional()
	store?: string;

	@ApiPropertyOptional({
		example: PaymentType.CASH,
		enum: PaymentType,
		description: 'The type of payment to filter transactions by.'
	})
	@IsOptional()
	@IsEnum(PaymentType)
	paymentType?: PaymentType;

	@ApiPropertyOptional({
		example: TransactionStatus.APPROVED,
		enum: TransactionStatus,
		description: 'The status of the transactions to filter by.'
	})
	@IsOptional()
	@IsEnum(TransactionStatus)
	status?: TransactionStatus;

	@ApiProperty({
		example: '2024-01-01',
		description: 'The start date to filter transactions from. This field is required.'
	})
	@IsNotEmpty()
	@IsValidDateString()
	fromDate?: Date;

	@ApiPropertyOptional({
		example: '2024-12-31',
		description: 'The end date to filter transactions to.'
	})
	@IsOptional()
	@IsValidDateString()
	toDate?: Date;
}
