import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { ProductEntity } from "src/product/product.entity";
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
import { ModifierGroupsEntity } from "./modifier-groups.entity";

@Entity()
export class ModifierOptionsEntity {
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => ProductEntity, { nullable: false })
	@JoinColumn({ name: "product", referencedColumnName: "id" })
	product: ProductEntity;

	@ManyToOne(() => ModifierGroupsEntity, { nullable: false })
	@JoinColumn({ name: "group", referencedColumnName: "id" })
	group: ModifierGroupsEntity;

	@Column({ type: "float", nullable: false })
	price: number;

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({
			message: `Inserted modifier_options with id: ${this.id}`,
			context: ModifierGroupsEntity.name,
		});
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({
			message: `Updated modifier_options with id: ${this.id}`,
			context: ModifierGroupsEntity.name,
		});
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({
			message: `Removed modifier_options with id: ${this.id}`,
			context: ModifierGroupsEntity.name,
		});
	}
}
