import { winstonLoggerConfig } from 'src/configs/winston-logger.config';
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Store } from '../../store/entities/store.entity'; // adjust the import path as necessary
import { SupplierEntity } from '../../supplier/supplier.entity'; // adjust the import path as necessary
import { InventoryItem } from '../inventories.entity'; // adjust the import path as necessary

@Entity('purchases')
export class Purchase {
    @CreateDateColumn({ name: 'createdAt', nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', nullable: false })
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @PrimaryGeneratedColumn()
    purchaseID: number;

    @Column({ type: 'int', nullable: false })
    inventoryItemID: number;

    @Column({ type: 'int', nullable: false })
    storeID: number;

    @Column({ type: 'int', nullable: false })
    supplierID: number;

    @Column({ type: 'date', nullable: false })
    purchaseDate: Date;

    @Column({ type: 'date', nullable: true })
    expirationDate: Date;

    @Column({ type: 'float', nullable: false })
    purchasePrice: number;

    @Column({ type: 'int', nullable: false })
    quantity: number;

    @Column({ type: 'text', nullable: true })
    note: string;

    @Column({ name: 'text', nullable: false })
    unit: string;

    // relations
    @ManyToOne(() => InventoryItem, { nullable: false })
    @JoinColumn({ name: 'inventoryItemID' })
    inventoryItem: InventoryItem;

    @ManyToOne(() => Store, { nullable: false })
    @JoinColumn({ name: 'storeID' })
    store: Store;

    @ManyToOne(() => SupplierEntity, { nullable: false })
    @JoinColumn({ name: 'supplierID' })
    supplier: SupplierEntity;

    //hooks
    @AfterInsert()
    afterInsert() {
        winstonLoggerConfig.debug({ message: `Inserted user with id: ${this.purchaseID}`, context: Purchase.name });
    }

    @AfterUpdate()
    afterUpdate() {
        winstonLoggerConfig.debug({ message: `Updated user with id: ${this.purchaseID}`, context: Purchase.name });
    }

    @AfterRemove()
    afterRemove() {
        winstonLoggerConfig.debug({ message: `Removed user with id: ${this.purchaseID}`, context: Purchase.name });
    }
}
