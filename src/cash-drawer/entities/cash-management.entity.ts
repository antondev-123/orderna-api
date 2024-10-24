import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CashRegisterEntity } from "./cash-register.entity";

@Entity()
export class CashManagementEntity {
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => CashRegisterEntity, cashRegisterEntity => cashRegisterEntity.cashManagementEntity)
	@JoinColumn({ name: "cashRegisterId" })
	cashRegisterEntity: CashRegisterEntity;

	@Column("float", { nullable: true })
	cashIn?: number;

	@Column("float", { nullable: true })
	cashOut?: number;

	@Column({
		type: "text",
		nullable: true,
	})
	note?: string;

	@Column("varchar", { nullable: true })
	isExpense?: string;

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted cash with id: ${this.id}`, context: CashManagementEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated cash with id: ${this.id}`, context: CashManagementEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed cash with id: ${this.id}`, context: CashManagementEntity.name });
	}
}