import { Logger } from "@nestjs/common";
import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DiscountStatus } from "../enums/discount-status.enum";
import { DiscountEntity } from "./discount.entity";

@Entity('discountStores')
export class DiscountStoreEntity {
    private readonly logger = new Logger(DiscountStoreEntity.name)

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @PrimaryGeneratedColumn('increment')
    discountStoreId?: number;

    @Column()
    discountId: number;

    @Column()
    storeId: number;

    @Column()
    storeName: string;

    @Column({ type: 'varchar', default: DiscountStatus.ACTIVE })
    discountStatus: DiscountStatus;

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
        winstonLoggerConfig.debug({ message: `Inserted discount store with id: ${this.discountStoreId}`, context: DiscountStoreEntity.name });
    }

    @AfterUpdate()
    afterUpdate() {
        winstonLoggerConfig.debug({ message: `Updated discount store with id: ${this.discountStoreId}`, context: DiscountStoreEntity.name });
    }

    @AfterRemove()
    afterRemove() {
        winstonLoggerConfig.debug({ message: `Removed discount store with id: ${this.discountStoreId}`, context: DiscountStoreEntity.name });
    }

}