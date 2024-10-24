import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { BaseEntity } from "src/db/entities/base.entity";
import { ModifierGroupsEntity } from "src/modifier-groups/entities/modifier-groups.entity";
import {
	AfterInsert,
	AfterRemove,
	AfterUpdate,
	Column,
	Entity,
	ManyToMany
} from "typeorm";

@Entity()
export class CategoryEntity extends BaseEntity {
	@Column({ nullable: false })
	name: string;

	@Column({ nullable: true })
	description: string;

	@ManyToMany(() => ModifierGroupsEntity, (modifierGroup) => modifierGroup.categories)
	modifierGroups: ModifierGroupsEntity[];

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted category with id: ${this.id}`, context: CategoryEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated category with id: ${this.id}`, context: CategoryEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed category with id: ${this.id}`, context: CategoryEntity.name });
	}
}