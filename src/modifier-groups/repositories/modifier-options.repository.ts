import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { ModifierOptionsEntity } from "../entities/modifier-options.entity";

@Injectable()
export class ModifierOptionsRepository extends Repository<ModifierOptionsEntity> {
	constructor(
		private readonly dataSource: DataSource,
	) {
		super(ModifierOptionsEntity, dataSource.createEntityManager());
	}

	async findModifierOption(groupId) {
		try {
			return await this.find({
				where: {
					group: groupId,
					deletedAt: null,
				},
				relations: {
					group: true
				}
			});
		} catch (error) {
			throw error;
		}
	}

	async deleteModifierOption(groupId) {
		try {
			return await this.update(
				{
					group: groupId,
				},
				{
					deletedAt: new Date(),
				},
			);
		} catch (error) {
			throw error;
		}
	}
}
