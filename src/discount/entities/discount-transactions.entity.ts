import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DiscountType } from "../enums/discount-type.enum";
import { DiscountEntity } from "./discount.entity";

@Entity('discountTransactions')
export class DiscountTransactionEntity {
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @PrimaryGeneratedColumn('increment')
    discountTransactionId?: number;

    @Column()
    transactionId: number;

    @Column()
    customerId: number;

    @Column()
    customerName: string;

    @Column()
    discountId: number;

    @Column()
    storeId: number;

    @Column()
    storeName: string;

    @Column()
    amount: number;

    @Column()
    discountValue: number;

    @Column()
    discountCode: string;

    @Column()
    discountName: string;

    @Column({ type: 'varchar', default: DiscountType.TOTAL_DISCOUNT })
    discountType: DiscountType;

    // relation
    @ManyToOne(() => DiscountEntity, (item) => item, { onDelete: 'SET NULL' })
    @JoinColumn({ name: "discountId", referencedColumnName: "discountId" })
    discount: DiscountEntity;
    // @ManyToMany(() => Store, (item) => item.id, { onDelete: 'SET NULL' })
    // @JoinColumn({ name: "storeId", referencedColumnName: "id" })
    // store: Store;

    //hooks
    @AfterInsert()
    afterInsert() {
        winstonLoggerConfig.debug({ message: `Inserted discount transaction with id: ${this.discountTransactionId}`, context: DiscountTransactionEntity.name });
    }

    @AfterUpdate()
    afterUpdate() {
        winstonLoggerConfig.debug({ message: `Updated discount transaction with id: ${this.discountTransactionId}`, context: DiscountTransactionEntity.name });
    }

    @AfterRemove()
    afterRemove() {
        winstonLoggerConfig.debug({ message: `Removed discount transaction with id: ${this.discountTransactionId}`, context: DiscountTransactionEntity.name });
    }
}