import { Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from "typeorm";
import { TransactionItemEntity } from "../entities/transaction-item.entity";

@Injectable()
export class TransactionItemRepository extends Repository<TransactionItemEntity> {
    constructor(
        private readonly dataSource: DataSource
    ) {
        super(TransactionItemEntity, dataSource.createEntityManager());
    }

    async findTransactionItem(transactionItemId) {
        try {
            const item = await this.findOne({
                where: {
                    id: transactionItemId,
                    deletedAt: null
                },
                relations: {
                    product: true
                }
            })
            return item
        } catch (error) {
            throw error;
        }
    }

    async findTransactionItemByTransaction(transactionId) {
        try {
            const item = await this.findOne({
                where: {
                    transaction: {
                        id: transactionId
                    },
                    deletedAt: null
                },
                relations: {
                    transaction: true
                }
            })
            return item
        } catch (error) {
            throw error;
        }
    }

    async findTransactionItemByTransactionId(transactionId) {
        try {
            const item = await this.find({
                where: {
                    transaction: {
                        id: transactionId
                    },
                    deletedAt: null
                }
            })
            return item
        } catch (error) {
            throw error;
        }
    }

    async deleteTransactionItem(transactionIds) {
        try {
            return await this.update(
                {
                    id: In(transactionIds),
                },
                {
                    deletedAt: new Date(),
                },
            );
        } catch (error) {
            throw error;
        }
    }

    async sumTransactionItemDetail(transactionId: string) {
        const item = await this.createQueryBuilder('transaction_item_entity')
            .select('SUM(transaction_item_entity.netPrice)', 'sum')
            .addSelect('SUM(transaction_item_entity.totalCost)', 'cost')
            .addSelect('SUM(transaction_item_entity.discountValue)', 'discount')
            .where('transaction_item_entity.transaction = :transactionId', { transactionId: transactionId })
            .getRawOne();

        return item
    }

}