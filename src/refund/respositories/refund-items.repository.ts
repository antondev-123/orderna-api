import { Injectable } from "@nestjs/common";
import { RefundItemsEntity } from "../entities/refund-items.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class RefundItemsRepository extends Repository<RefundItemsEntity> {
	constructor(private readonly dataSource: DataSource) {
		super(RefundItemsEntity, dataSource.createEntityManager());
	}
}
