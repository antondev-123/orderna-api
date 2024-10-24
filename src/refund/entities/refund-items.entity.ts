import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RefundEntity } from "./refund.entity";
import { ProductEntity } from "../../product/product.entity";

@Entity({
	name: "refund_transaction_items",
})
export class RefundItemsEntity {
	@PrimaryGeneratedColumn("increment")
	id: string;

	@Column()
	quantity: number;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => RefundEntity, refund => refund.id)
	refund: RefundEntity;

	@ManyToOne(() => ProductEntity, product => product.id)
	product: ProductEntity;
}
