import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TransactionEntity } from "../../transaction/entities/transaction.entity";
import { RefundItemsEntity } from "./refund-items.entity";

@Entity({
	name: "refund_transactions",
})
export class RefundEntity {
	@PrimaryGeneratedColumn("increment")
	id: string;

	@Column()
	refund_number: string;

	@Column()
	refund_amount: number;

	@Column()
	refund_reason: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@DeleteDateColumn()
	deletedAt: Date;

	@ManyToOne(() => TransactionEntity, transaction => transaction.id)
	transaction: TransactionEntity;

	@OneToMany(() => RefundItemsEntity, refundItems => refundItems.refund)
	items: RefundItemsEntity[];
}
