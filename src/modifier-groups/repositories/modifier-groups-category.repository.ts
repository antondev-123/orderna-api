import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ModifierGroupsCategoryEntity } from "../entities/modifier-groups-category.entity";

@Injectable()
export class ModifierGroupsCategoryRepository extends Repository<ModifierGroupsCategoryEntity> {
	constructor(
		private readonly dataSource: DataSource,
	) {
		super(ModifierGroupsCategoryEntity, dataSource.createEntityManager());
	}

	async deleteModifierCategory(groupId) {
		try {
			return await this.delete({
				modifier_group_id: groupId,
			});
		} catch (error) {
			throw error;
		}
	}
}
