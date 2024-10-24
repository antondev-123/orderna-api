import { Injectable } from "@nestjs/common";
import { Brackets, DataSource, Repository } from "typeorm";
import { ModifierGroupsEntity } from "../entities/modifier-groups.entity";

@Injectable()
export class ModifierGroupsRepository extends Repository<ModifierGroupsEntity> {
	constructor(
		private readonly dataSource: DataSource,
	) {
		super(ModifierGroupsEntity, dataSource.createEntityManager());
	}

	async findModifierGroup(id: number) {
		try {
			return await this.findOne({
				where: {
					id: id,
					deletedAt: null,
				},
			});
		} catch (error) {
			throw error;
		}
	}

	async deleteModifier(id: number) {
		try {
			return await this.update(
				{
					id: id,
				},
				{
					deletedAt: new Date(),
				},
			);
		} catch (error) {
			throw error;
		}
	}

	async findModifierData(modifierId) {
		try {
			const query = await this.createQueryBuilder("modifier")
				.where("modifier.id = :modifierId", { modifierId: modifierId })
				.leftJoin("modifier_options_entity", "mo", "mo.group = modifier.id")
				.leftJoin("mo.product", "product")
				.leftJoin("modifier_groups_category_entity", "mgc", "mgc.modifier_group_id = modifier.id")
				.leftJoin("mgc.category", "category")
				.select([
					"modifier.id AS id",
					"modifier.title AS title",
					"modifier.sku_plu AS sku_plu",
					"modifier.limit AS option_limit",
					"modifier.description AS description",
					"product.title AS option",
					"product.id AS option_id",
					"category.id AS category_id",
					"category.name AS category",
				])
				.getRawMany()
			return query
		} catch (error) {
			throw error
		}
	}

	async findModifierList(search, skip, take) {
		try {
			const query = await this.createQueryBuilder("modifier")
				.leftJoin("modifier_options_entity", "mo", "mo.group = modifier.id")
				.leftJoin("mo.product", "product")
				.select([
					"modifier.id AS id",
					"modifier.title AS title",
					"product.title AS option",
				]);
			let count;
			if (search) {
				const searchLower = search.toLowerCase();
				query.andWhere(
					new Brackets(qb => {
						qb.where("LOWER(modifier.title) LIKE :search", {
							search: `%${searchLower}%`,
						});
					}),
				);
				count = await query.getCount();
			} else {
				count = await query.getCount();
			}
			const modifier = await query.take(take).skip(skip).getRawMany();
			return [modifier, count];
		} catch (error) {
			throw error;
		}
	}
}
