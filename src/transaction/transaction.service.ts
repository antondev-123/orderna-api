import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
	customerResponseMessage,
	errorResponseMessage,
	productResponseMessage,
	staffResponseMessage,
	storeResponseMessage,
	transactionItemResponseMessage,
	transactionResponseMessage,
} from "src/common/constants/response-messages";
import { pagination } from "src/common/dtos/pagination-default";
import { CustomersRepository } from "src/customer/customer.repository";
import { ProductEntity } from "src/product/product.entity";
import { ProductRepository } from "src/product/product.repository";
import { StoreRepository } from "src/store/repository/store.repository";
import { UsersRepository } from "src/user/users.repository";
import { CreateTransactionDto } from "./dtos/create-transaction.dto";
import { EditTransactionDto } from "./dtos/edit-transaction.dto";
import { ListTransactionDto } from "./dtos/list-transaction.dto";
import { TransactionIdDto } from "./dtos/params-transaction.dto";
import { TransactionEntity } from "./entities/transaction.entity";
import { TransactionItemRepository } from "./repositories/transaction-item.repository";
import { TransactionRepository } from "./repositories/transaction.repository";
import { In } from "typeorm";

@Injectable()
export class TransactionService {
	constructor(
		@InjectRepository(TransactionRepository)
		private transactionRepository: TransactionRepository,
		@InjectRepository(CustomersRepository)
		private customersRepository: CustomersRepository,
		@InjectRepository(StoreRepository)
		private storeRepository: StoreRepository,
		@InjectRepository(UsersRepository)
		private usersRepository: UsersRepository,
		@InjectRepository(ProductRepository)
		private productRepository: ProductRepository,
		@InjectRepository(TransactionItemRepository)
		private transactionItemRepository: TransactionItemRepository,
	) { }

	async addTransaction(createTransactionDto: CreateTransactionDto) {
		try {
			const transactionJson: any = new TransactionEntity();
			if (createTransactionDto.customer) {
				const customer = await this.customersRepository.findCustomerById(createTransactionDto.customer);
				if (!customer) {
					throw new NotFoundException(customerResponseMessage.CUSTOMER_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
				}

				transactionJson.customer = customer.id;
			}
			const store = await this.storeRepository.findStoreById(createTransactionDto.store);
			if (!store) {
				throw new NotFoundException(storeResponseMessage.STORE_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}
			transactionJson.store = store.id;
			const staff = await this.usersRepository.findStaffById(createTransactionDto.staff);
			if (!staff) {
				throw new NotFoundException(staffResponseMessage.STAFF_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}

			transactionJson.staff = staff.id;
			Object.assign(transactionJson, createTransactionDto);
			const transaction = this.transactionRepository.create(transactionJson);
			const saveTransaction: any = await this.transactionRepository.save(transaction);

			for (const data of createTransactionDto.item) {
				const product = await this.productRepository.findProductById(data.product);
				if (!product) {
					throw new NotFoundException(productResponseMessage.PRODUCT_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
				}
				const totalPrice = product.price * data.quantity;
				const totalCost = product.cost * data.quantity;
				const transactionItem = this.transactionItemRepository.create();
				if (data.discountValue) {
					transactionItem.discountValue = data.discountValue;
				}
				transactionItem.totalValue = totalPrice;
				transactionItem.totalCost = totalCost;
				transactionItem.netPrice = totalPrice - (transactionItem.discountValue ?? 0);
				transactionItem.quantity = data.quantity;
				transactionItem.isRefund = data.isRefund;
				transactionItem.remainingQuantity = data.quantity;
				transactionItem.remainingAmount = totalPrice;
				transactionItem.product = { id: product.id } as ProductEntity;
				transactionItem.transaction = { id: saveTransaction["id"] } as TransactionEntity;

				await this.transactionItemRepository.save(transactionItem);
			}
			await this.updateTransactionValueFromItem(saveTransaction["id"]);
			return transaction;
		} catch (error) {
			throw error;
		}
	}

	async editTransaction(transactionIdDto: TransactionIdDto, editTransactionDto: EditTransactionDto) {
		try {
			const products = await this.productRepository.findAllProduct();
			const transaction: any = await this.transactionRepository.findTransactionById(transactionIdDto.transactionId);
			if (!transaction) {
				throw new NotFoundException(transactionResponseMessage.TRANSACTION_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
			}
			if (editTransactionDto.customer) {
				const customer: any = await this.customersRepository.findCustomerById(editTransactionDto.customer);
				if (!customer) {
					throw new NotFoundException(customerResponseMessage.CUSTOMER_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN);
				}
				transaction.customer = customer.id;
			}
			if (editTransactionDto.staff) {
				const staff: any = await this.usersRepository.findStaffById(editTransactionDto.staff);
				if (!staff) {
					throw new NotFoundException(staffResponseMessage.STAFF_NOT_FOUND, errorResponseMessage.NOT_FOUND.EN);
				}
				transaction.staff = staff.id;
			}
			if (editTransactionDto.store) {
				const store: any = await this.storeRepository.findStoreById(editTransactionDto.store);
				if (!store) {
					throw new NotFoundException(storeResponseMessage.STORE_NOT_FOUND, errorResponseMessage.NOT_FOUND.EN);
				}
				transaction.store = store.id;
			}

			if (editTransactionDto.item) {
				for (const data of editTransactionDto.item) {
					const transactionItem = await this.transactionItemRepository.findTransactionItem(data.transactionItemId);
					if (!transactionItem) {
						throw new NotFoundException(transactionItemResponseMessage.TRANSACTION_ITEM_NOT_FOUND, errorResponseMessage.NOT_FOUND.EN);
					}
					if (data.isRefund != null) {
						transactionItem.isRefund = data.isRefund;
					}
					if (data.product && data.quantity) {
						const product: any = products.find(p => p.id === data.product);
						const totalPrice = product.price * data.quantity;
						const totalCost = product.cost * data.quantity;
						transactionItem.product = product.id;
						transactionItem.quantity = data.quantity;
						transactionItem.totalValue = totalPrice;
						transactionItem.totalCost = totalCost;
						transactionItem.discountValue = transactionItem.discountValue;
						transactionItem.netPrice = totalPrice - transactionItem.discountValue;
					}
					if (data.product && !data.quantity) {
						const product: any = products.find(p => p.id === data.product);
						const totalPrice = product.price * transactionItem.quantity;
						const totalCost = product.cost * transactionItem.quantity;
						transactionItem.product = product.id;
						transactionItem.quantity = transactionItem.quantity;
						transactionItem.totalValue = totalPrice;
						transactionItem.totalCost = totalCost;
						transactionItem.discountValue = transactionItem.discountValue;
						transactionItem.netPrice = totalPrice - transactionItem.discountValue;
					}
					if (data.quantity && !data.product) {
						const product: any = products.find(p => (p as any).id === transactionItem.product.id);
						const totalPrice = product.price * data.quantity;
						const totalCost = product.cost * data.quantity;
						transactionItem.product = transactionItem.product;
						transactionItem.totalValue = totalPrice;
						transactionItem.totalCost = totalCost;
						transactionItem.quantity = data.quantity;
						transactionItem.discountValue = transactionItem.discountValue;
						transactionItem.netPrice = totalPrice - transactionItem.discountValue;
					}
					await this.transactionItemRepository.save(transactionItem);
					await this.updateTransactionValueFromItem(transaction.id);
					return transaction;
				}
			}
			if (editTransactionDto.deleteItem) {
				await this.transactionItemRepository.deleteTransactionItem(editTransactionDto.deleteItem);
			}
			Object.assign(transaction, editTransactionDto);
			await this.transactionRepository.save(transaction);
			return transaction;
		} catch (error) {
			throw error;
		}
	}

	async deleteTransaction(transactionIdDto: TransactionIdDto) {
		try {
			const transaction = await this.transactionRepository.findTransactionById(transactionIdDto.transactionId);
			if (!transaction) {
				throw new NotFoundException(transactionResponseMessage.TRANSACTION_NOT_FOUND, errorResponseMessage.NOT_FOUND.EN);
			}

			await this.transactionRepository.deleteTransaction(transaction.id);
			return transaction;
		} catch (error) {
			throw error;
		}
	}

	async getTransactionList(listTransactionDto: ListTransactionDto) {
		try {
			const skip = ((listTransactionDto.page ?? pagination.defaultPage) - 1) * (listTransactionDto.size ?? pagination.pageSize);
			const take = listTransactionDto.size ?? pagination.pageSize;

			const [transaction, total_record] = await this.transactionRepository.findTransactionList({
				store: listTransactionDto.store,
				paymentType: listTransactionDto.paymentType,
				status: listTransactionDto.status,
				fromDate: listTransactionDto.fromDate,
				toDate: listTransactionDto.toDate,
				search: listTransactionDto.search,
				skip: skip,
				take: take,
			});
			if (!(transaction && transaction.length)) {
				return { transaction: [], total_record: 0 };
			}
			return { transaction: transaction, total_record: total_record };
		} catch (error) {
			throw error;
		}
	}

	async getTransactionDetails(transactionIdDto: TransactionIdDto) {
		try {
			const transaction = await this.transactionRepository.findTransactionDetailsById(transactionIdDto.transactionId);
			if (!transaction) {
				throw new NotFoundException(transactionResponseMessage.TRANSACTION_NOT_FOUND, errorResponseMessage.NOT_FOUND.EN);
			}
			const transactionItem = await this.transactionItemRepository.findTransactionItemByTransactionId(transaction.id);
			const response = {
				...transaction,
				transactionItem: transactionItem,
			};
			return response;
		} catch (error) {
			throw error;
		}
	}

	async bulkDeleteTransactions(ids: number[]) {
		try {
			// TODO: Check if better to move some of logic here to repository
			const transactions = await this.transactionRepository.findBy({ id: In(ids) });
			if (transactions.length === 0) {
				throw new NotFoundException(
					transactionResponseMessage.TRANSACTIONS_NOT_FOUND,
					errorResponseMessage.NOT_FOUND.EN
				);
			}
			await this.transactionRepository.remove(transactions);
			return transactions;
		} catch (error) {
			throw error;
		}
	}

	private async updateTransactionValueFromItem(transactionId: string) {
		const sumItemDetails = await this.transactionItemRepository.sumTransactionItemDetail(transactionId);
		await this.transactionRepository.transactionUpdate(sumItemDetails, transactionId);
		return sumItemDetails;
	}
}
