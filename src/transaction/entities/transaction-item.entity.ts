import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { ProductEntity } from "src/product/product.entity";
import { TransactionEntity } from "src/transaction/entities/transaction.entity";
import {
	AfterInsert,
	AfterRemove,
	AfterUpdate,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity()
export class TransactionItemEntity {
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "float", nullable: false })
	totalValue: number;

	@Column({ type: "float", nullable: false })
	totalCost: number;

	@Column({ type: "float", nullable: true })
	discountValue: number;

	@Column({ type: "float", nullable: false })
	netPrice: number;

	@Column({ type: "int", nullable: false })
	quantity: number;

	@Column({ type: "int", nullable: false })
	remainingQuantity: number;

	@Column({ type: "int", nullable: false })
	remainingAmount: number;

	@Column({ type: "boolean", nullable: false, default: false })
	isRefund: boolean;

	//relations
	@ManyToOne(() => ProductEntity, { nullable: false })
	@JoinColumn({ name: "product", referencedColumnName: "id" })
	product: ProductEntity;

	@ManyToOne(() => TransactionEntity, (transaction) => transaction.transactionItems, { onDelete: "CASCADE" })
	@JoinColumn({ name: "transaction", referencedColumnName: "id" })
	transaction: TransactionEntity;

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted transaction item with id: ${this.id}`, context: TransactionItemEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated transaction item with id: ${this.id}`, context: TransactionItemEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed transaction item with id: ${this.id}`, context: TransactionItemEntity.name });
	}
}
