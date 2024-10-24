import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { Store } from "src/store/entities/store.entity";
import { UserEntity } from "src/user/entities/user.entity";
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
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { CashManagementEntity } from "./cash-management.entity";

@Entity()
export class CashRegisterEntity {
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@PrimaryGeneratedColumn()
	id!: number;

	@Column({
		type: "text",
		nullable: false,
	})
	registerName: string;

	@Column({
		type: "timestamptz",
		nullable: false,
		default: () => "CURRENT_TIMESTAMP",
	})
	opened: Date;

	@Column({
		type: "timestamptz",
		nullable: true,
	})
	closed: Date;

	@Column({
		type: "float",
		nullable: false,
		default: 0,
	})
	counted: number;

	@Column({
		type: "float",
		nullable: false,
	})
	amount: number;

	@Column({
		type: "text",
		nullable: true,
	})
	openNote?: string;

	@Column({
		type: "text",
		nullable: true,
	})
	closeNote?: string;

	//relations
	@ManyToOne(() => UserEntity, user => user.cashRegisterEntity)
	@JoinColumn({ name: "userId" })
	user: UserEntity;

	@OneToMany(() => CashManagementEntity, cashManagementEntity => cashManagementEntity.cashRegisterEntity)
	cashManagementEntity: CashManagementEntity[];

	@ManyToOne(() => Store, store => store.cashRegisterEntity)
	@JoinColumn()
	store: Store;

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted cash register with id: ${this.id}`, context: CashRegisterEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated cash register with id: ${this.id}`, context: CashRegisterEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed cash register with id: ${this.id}`, context: CashRegisterEntity.name });
	}
}
