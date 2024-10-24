import { Injectable } from "@nestjs/common";
import { Brackets, DataSource, In, Repository } from "typeorm";
import { ProductEntity } from "./product.entity";

@Injectable()
export class ProductRepository extends Repository<ProductEntity> {
	constructor(
		private readonly dataSource: DataSource) {
		super(ProductEntity, dataSource.createEntityManager());
	}

	async findProductById(productId) {
		try {
			const product = await this.findOne({
				where: {
					id: productId,
					deletedAt: null,
				},
			});
			return product;
		} catch (error) {
			throw error;
		}
	}

	async findProductDetailsById(productId) {
		try {
			const product = await this.findOne({
				where: {
					id: productId,
					deletedAt: null,
				},
				relations: {
					store: true
				}
			});
			return product;
		} catch (error) {
			throw error;
		}
	}

	async deleteProduct(productId) {
		try {
			return await this.update(
				{
					id: productId,
				},
				{
					deletedAt: new Date(),
				},
			);
		} catch (error) {
			throw error;
		}
	}

	async findProductList(search, skip, take) {
		try {
			const query = this.createQueryBuilder("product")
				.leftJoinAndSelect('product.store', 'store')
			let count;
			if (search) {
				const searchLower = search.toLowerCase();
				query.andWhere(
					new Brackets(qb => {
						qb.where("LOWER(product.title) LIKE :search", {
							search: `%${searchLower}%`,
						});
					}),
				);
				count = await query.getCount();
			} else {
				count = await query.getCount();
			}
			const product = await query.take(take).skip(skip).getMany();
			return [product, count];
		} catch (error) {
			throw error;
		}
	}

	async findAllProduct() {
		try {
			return await this.find({
				where: {
					deletedAt: null
				}
			})
		} catch (error) {
			throw error;
		}
	}

	async findProductCategoryByIds(productId) {
		try {
			return await this.find({
				where: {
					id: In(productId),
					deletedAt: null,
				},
			});
		} catch (error) {
			throw error
		}
	}
}
