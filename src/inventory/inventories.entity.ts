import { winstonLoggerConfig } from 'src/configs/winston-logger.config';
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('inventory')
export class InventoryItem {
    @CreateDateColumn({ name: 'createdAt', nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', nullable: false })
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @PrimaryGeneratedColumn()
    inventoryItemID: number;

    @Column({ name: 'storeID', type: 'int', nullable: false, foreignKeyConstraintName: 'storeID' })
    storeID: number;

    @Column({ name: 'title', length: 180, nullable: false })
    title: string;

    @Column({ name: 'unit', nullable: false })
    unit: string;

    @Column({ name: 'sk_plu', nullable: true })
    sk_plu: string;

    //hooks
    @AfterInsert()
    afterInsert() {
        winstonLoggerConfig.debug({ message: `Inserted user with id: ${this.inventoryItemID}`, context: InventoryItem.name });
    }

    @AfterUpdate()
    afterUpdate() {
        winstonLoggerConfig.debug({ message: `Updated user with id: ${this.inventoryItemID}`, context: InventoryItem.name });
    }

    @AfterRemove()
    afterRemove() {
        winstonLoggerConfig.debug({ message: `Removed user with id: ${this.inventoryItemID}`, context: InventoryItem.name });
    }
}