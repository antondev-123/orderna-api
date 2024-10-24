import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Store } from "../entities/store.entity";

@Injectable()
export class StoreRepository extends Repository<Store> {
	constructor(private readonly dataSource: DataSource) {
		super(Store, dataSource.createEntityManager());
	}

	async findStoreById(storeId) {
		try {
			const store = await this.findOne({
				where: {
					id: storeId,
					deletedAt: null,
				},
			});
			return store;
		} catch (error) {
			throw error;
		}
	}
}
