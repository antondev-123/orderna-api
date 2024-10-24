import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DiscountStatus } from "../enums/discount-status.enum";
import { DiscountType } from "../enums/discount-type.enum";
import { DiscountStoreEntity } from "./discount-stores.entity";

@Entity('discounts')
export class DiscountEntity {
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @PrimaryGeneratedColumn('increment')
    discountId?: number;

    @Column()
    discountCode: string;

    @Column()
    discountName: string;

    @Column({ type: 'varchar' })
    discountType: DiscountType;

    @Column({ type: 'decimal' })
    discountValue: number;

    @Column({ type: 'integer' })
    minimumSpend: number;

    @Column({ type: 'integer' })
    limitOverall: number;

    @Column({ type: 'integer' })
    limitCustomer: number;

    @Column({ type: 'varchar', default: DiscountStatus.ACTIVE })
    discountStatus: DiscountStatus;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    // relation
    // @OneToMany(() => DiscountStoreEntity, discountStore => discountStore.discount)
    // discountStores: DiscountStoreEntity[];

    @OneToMany(() => DiscountStoreEntity, (item) => item, { onDelete: 'SET NULL' })
    @JoinColumn({ name: "discountId", referencedColumnName: "discountId" })
    discountStores: DiscountStoreEntity[];

    //hooks
    @AfterInsert()
    afterInsert() {
        winstonLoggerConfig.debug({ message: `Inserted user with id: ${this.discountId}`, context: DiscountEntity.name });
    }

    @AfterUpdate()
    afterUpdate() {
        winstonLoggerConfig.debug({ message: `Updated user with id: ${this.discountId}`, context: DiscountEntity.name });
    }

    @AfterRemove()
    afterRemove() {
        winstonLoggerConfig.debug({ message: `Removed user with id: ${this.discountId}`, context: DiscountEntity.name });
    }
}