import { CategoryEntity } from "src/category/category.entity";
import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import {
	AfterInsert,
	AfterRemove,
	AfterUpdate,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity()
export class ModifierGroupsEntity {
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ nullable: false })
	title: string;

	@Column({ nullable: true })
	sku_plu: string;

	@Column({ type: "int", nullable: false })
	limit: number;

	@Column({ nullable: true })
	description: string;

	@ManyToMany(() => CategoryEntity, category => category.modifierGroups)
	categories: CategoryEntity[];

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({
			message: `Inserted modifier_group with id: ${this.id}`,
			context: ModifierGroupsEntity.name,
		});
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({
			message: `Updated modifier_group with id: ${this.id}`,
			context: ModifierGroupsEntity.name,
		});
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({
			message: `Removed modifier_group with id: ${this.id}`,
			context: ModifierGroupsEntity.name,
		});
	}
}
