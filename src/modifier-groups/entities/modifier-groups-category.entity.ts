import {
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryColumn,
} from "typeorm";
import { ModifierGroupsEntity } from "./modifier-groups.entity";
import { CategoryEntity } from "src/category/category.entity";

@Entity()
export class ModifierGroupsCategoryEntity {
	@PrimaryColumn()
	modifier_group_id: number;

	@PrimaryColumn()
	category_id: number;

	@ManyToOne(
		() => ModifierGroupsEntity,
		modifierGroup => modifierGroup.categories,
		{ nullable: false },
	)
	@JoinColumn({ name: "modifier_group_id", referencedColumnName: "id" })
	modifier_group: ModifierGroupsEntity;

	@ManyToOne(() => CategoryEntity, category => category.modifierGroups, {
		nullable: false,
	})
	@JoinColumn({ name: "category_id", referencedColumnName: "id" })
	category: CategoryEntity;
}
