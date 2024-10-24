import { Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { CreateRefundDto } from "./dto/create-refund.dto";
import { DataSource } from "typeorm";
import { TransactionRepository } from "../transaction/repositories/transaction.repository";
import { TransactionStatus } from "../common/constants";
import { refundResponseMessage } from "../common/constants/response-messages/refund.response-message";
import { FilterRefundDto } from "./dto/filter-refund.dto";
import { Generator } from "../common/utils/generator.util";
import { RefundRepository } from "./respositories/refund.repository";
import { RefundItemsRepository } from "./respositories/refund-items.repository";

@Injectable()
export class RefundService {
	constructor(
		private readonly transactionRepository: TransactionRepository,
		private readonly refundRepository: RefundRepository,
		private readonly refundItemsRepository: RefundItemsRepository,
		private readonly dataSource: DataSource,
	) {}

	async create(createRefundDto: CreateRefundDto) {
		const validationTransaction = await this.transactionRepository.findTransactionById(createRefundDto.transactionId);
		if (!validationTransaction) {
			throw new NotFoundException(refundResponseMessage.TRANSACTION_NOT_FOUND.EN);
		}
		if (validationTransaction.status != TransactionStatus.APPROVED) {
			throw new NotFoundException(refundResponseMessage.REFUND_STATUS_UNVERIFIED.EN);
		}

		//compare transaction items with refund items
		const refundItemValid = [];
		createRefundDto.items.forEach(refundItem => {
			const transactionItem = validationTransaction.transactionItems.find(transactionItem => transactionItem.product.id == refundItem.productId);
			if (!transactionItem) {
				throw new NotFoundException(`${refundResponseMessage.REFUND_ITEM_NOT_FOUND.EN}`);
			}
			if (transactionItem.remainingQuantity < refundItem.quantity) {
				throw new NotFoundException(refundResponseMessage.REFUND_ITEM_QUANTITY_MORE.EN);
			}
			refundItemValid.push({
				...refundItem,
				refundAmount: (transactionItem.totalValue / transactionItem.quantity) * refundItem.quantity,
				remainingQuantity: transactionItem.remainingQuantity,
				remainingAmount: transactionItem.remainingAmount,
			});
		});

		//get quantity of refund
		const quantityRefund = await this.refundRepository.findQuantityRefundToday();

		const refundNumber = Generator.generateNumber(parseInt(quantityRefund.toString()) + 1, "REFUND");
		const data = {
			refund_number: refundNumber,
			refund_amount: refundItemValid.reduce((acc, curr) => acc + curr.refundAmount, 0),
			refund_reason: createRefundDto.refundReason,
			transaction: validationTransaction,
		};

		try {
			const queryRunner = this.dataSource.createQueryRunner();
			await queryRunner.connect();
			await queryRunner.startTransaction();
			try {
				//insert refund
				const insert = await this.refundRepository.save(data);
				//update transaction items
				let summaryValue = 0;
				refundItemValid.map(async refundItem => {
					summaryValue += data.refund_amount;

					await this.transactionRepository.updateTransactionItems({
						transactionId: createRefundDto.transactionId,
						productId: refundItem.productId,
						remainingQuantity: refundItem.remainingQuantity - refundItem.quantity,
						remainingAmount: (refundItem.remainingAmount / refundItem.remainingQuantity) * (refundItem.remainingQuantity - refundItem.quantity),
						isRefund: refundItem.remainingQuantity - refundItem.quantity == 0,
					});

					//insert refund items
					await this.refundItemsRepository.save({
						quantity: refundItem.quantity,
						product: { id: refundItem.productId },
						refund: insert,
					});
				});
				//update transaction
				await this.transactionRepository.updateTransaction({
					transactionId: validationTransaction.id,
					refund: validationTransaction.refund + summaryValue,
					status:
						validationTransaction.totalValue == validationTransaction.refund + summaryValue ? TransactionStatus.REFUNDED : TransactionStatus.APPROVED,
				});

				//commit transaction
				await queryRunner.commitTransaction();
				return {
					id: insert.id,
					refundNumber: insert.refund_number,
					refundAmount: insert.refund_amount,
					refundReason: insert.refund_reason,
					transactionId: insert.transaction.id,
					createdAt: insert.createdAt,
				};
			} catch (error) {
				//rollback transaction
				await queryRunner.rollbackTransaction();
				throw new UnprocessableEntityException(error.message);
			} finally {
				//release queryRunner
				await queryRunner.release();
			}
		} catch (error) {
			throw new UnprocessableEntityException(error.message);
		}
	}

	async findAll(filter: FilterRefundDto) {
		const { page = 1, limit = 10 } = filter;
		const offset = (page - 1) * limit;

		const count = await this.refundRepository.count({
			take: filter.limit,
			skip: offset,
		});
		if (count == 0) {
			throw new NotFoundException(refundResponseMessage.REFUND_NOT_FOUND.EN);
		}

		const data = await this.refundRepository.findRefundList(filter);

		return {
			refunds: data,
			pagination: {
				totalPages: Math.ceil(count / limit),
				currentPage: parseInt(page.toString()),
			},
		};
	}

	async findOne(id: number) {
		const findOne = await this.refundRepository.findRefundById(id);

		if (!findOne) {
			throw new NotFoundException(refundResponseMessage.REFUND_NOT_FOUND.EN);
		}

		return findOne;
	}
}
