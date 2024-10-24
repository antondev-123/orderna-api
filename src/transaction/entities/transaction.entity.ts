import { CashRegisterEntity } from "src/cash-drawer/entities/cash-register.entity";
import { PaymentType } from "src/common/constants/enums/payment-type.enum";
import { TransactionStatus } from "src/common/constants/enums/transaction-status.enum";
import { TransactionType } from "src/common/constants/enums/transaction-type.enum";
import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { CustomerEntity } from "src/customer/customer.entity";
import { BaseEntity } from "src/db/entities/base.entity";
import { Store } from "src/store/entities/store.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { AfterInsert, AfterRemove, AfterUpdate, Column, Entity, JoinColumn, ManyToOne, OneToOne, OneToMany } from "typeorm";
import { TransactionItemEntity } from "./transaction-item.entity";

@Entity()
export class TransactionEntity extends BaseEntity {
	// TODO: Uses BaseEntity where id is number
	//       but id of transaction should be a uuid string
	@Column({ type: "float", nullable: true })
	totalValue: number;

	@Column({ type: "float", nullable: true })
	totalCost: number;

	@Column({ type: "float", nullable: true })
	totalDiscount: number;

	@Column({ type: "float", nullable: true })
	serviceChargeRate: number;

	@Column({ type: "float", nullable: true })
	tip: number;

	@Column({ type: "float", nullable: true })
	refund: number;

	@Column({ type: "float", nullable: false })
	salesTaxRate: number;

	@Column({ type: "varchar", nullable: false, default: PaymentType.CASH })
	paymentType: PaymentType;

	@Column({ type: "varchar", nullable: false, default: TransactionStatus.APPROVED })
	status: TransactionStatus;

	@Column({ type: "varchar", nullable: false, default: TransactionType.COUNTER })
	type: TransactionType;

	@Column({ type: "date", nullable: false })
	transactionDate: Date;

	@Column({ nullable: true })
	note: string;

	//relations
	// TODO: Consider using different names for @JoinColumn so it's not confusing
	//       e.g. cashRegisterId, storeId, customerId, staffId
	@OneToOne(() => CashRegisterEntity, { nullable: true })
	@JoinColumn({ name: "cashRegister", referencedColumnName: "id" })
	cashRegister: CashRegisterEntity;

	@ManyToOne(() => Store, { nullable: false })
	@JoinColumn({ name: "store", referencedColumnName: "id" })
	store: Store;

	@ManyToOne(() => CustomerEntity, { nullable: true })
	@JoinColumn({ name: "customer", referencedColumnName: "id" })
	customer: CustomerEntity;

	@ManyToOne(() => UserEntity, { nullable: false })
	@JoinColumn({ name: "staff", referencedColumnName: "id" })
	staff: UserEntity;

	// relations with transaction items
	@OneToMany(() => TransactionItemEntity, transactionItem => transactionItem.transaction, { onDelete: 'CASCADE' })
	transactionItems: TransactionItemEntity[];

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted transaction with id: ${this.id}`, context: TransactionEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated transaction with id: ${this.id}`, context: TransactionEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed transaction with id: ${this.id}`, context: TransactionEntity.name });
	}
}
