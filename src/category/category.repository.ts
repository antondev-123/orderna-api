import { Injectable } from "@nestjs/common";
import { Brackets, DataSource, In, Repository } from "typeorm";
import { CategoryEntity } from "./category.entity";

@Injectable()
export class CategoryRepository extends Repository<CategoryEntity> {
	constructor(
		private readonly dataSource: DataSource,
	) {
		super(CategoryEntity, dataSource.createEntityManager());
	}

	async findCategoryById(categoryId) {
		try {
			return await this.findOne({
				where: {
					id: categoryId,
					deletedAt: null,
				},
			});
		} catch (error) {
			throw error;
		}
	}

	async findCategoryByIds(categoryId) {
		try {
			return await this.find({
				where: {
					id: In(categoryId),
					deletedAt: null,
				},
			});
		} catch (error) {
			throw error;
		}
	}

	async deleteCategory(categoryId) {
		try {
			return await this.update(
				{
					id: categoryId,
				},
				{
					deletedAt: new Date(),
				},
			);
		} catch (error) {
			throw error;
		}
	}

	async findCategoryList(search, skip, take) {
		try {
			const query = this.createQueryBuilder("category");
			let count;
			if (search) {
				const searchLower = search.toLowerCase();
				query.andWhere(
					new Brackets(qb => {
						qb.where("LOWER(category.name) LIKE :search", {
							search: `%${searchLower}%`,
						});
					}),
				);
				count = await query.getCount();
			} else {
				count = await query.getCount();
			}
			const category = await query.take(take).skip(skip).getMany();
			return [category, count];
		} catch (error) {
			throw error;
		}
	}
}
