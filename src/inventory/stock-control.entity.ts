import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { InventoryItem } from './inventories.entity';
import { Purchase } from './purchase/purchase.entity';

@Entity('stock_control')
export class StockControl {
    @PrimaryGeneratedColumn()
    stockControlID!: number;

    @Column({ type: 'int', nullable: false })
    inventoryItemID!: number;

    @ManyToOne(() => InventoryItem)
    @JoinColumn({ name: 'inventoryItemID' })
    inventoryItem!: InventoryItem;

    @Column({ type: 'int', nullable: false })
    purchaseID!: number;

    @ManyToOne(() => Purchase, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'purchaseID' })
    purchase!: Purchase;

    @Column({ name: 'addStock', type: 'int', nullable: false })
    addStock!: number;

    @Column({ name: 'deductStock', type: 'int', nullable: false })
    deductStock!: number;

    @CreateDateColumn({ name: 'createdAt', nullable: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', nullable: false })
    updatedAt: Date;
}
