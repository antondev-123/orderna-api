import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { RefundEntity } from "../entities/refund.entity";
import { FilterRefundDto } from "../dto/filter-refund.dto";

@Injectable()
export class RefundRepository extends Repository<RefundEntity> {
	constructor(private readonly dataSource: DataSource) {
		super(RefundEntity, dataSource.createEntityManager());
	}

	async findQuantityRefundToday() {
		try {
			return await this.createQueryBuilder("refund")
				.where("refund.createdAt >= :startDate", { startDate: new Date(new Date().setHours(0, 0, 0, 0)) })
				.getCount();
		} catch (error) {
			throw error;
		}
	}

	async findRefundList(filter: FilterRefundDto) {
		try {
			const { page = 1, limit = 10 } = filter;
			const offset = (page - 1) * limit;

			const order = {};
			if (filter.sortBy) {
				order[filter.sortBy] = filter.sortOrder || "DESC";
			}

			return await this.find({
				relations: ["transaction", "items", "items.product"],
				select: {
					transaction: {
						id: true,
						totalValue: true,
						totalCost: true,
						status: true,
						salesTaxRate: true,
						paymentType: true,
						type: true,
						note: true,
						transactionDate: true,
					},
					items: {
						id: true,
						quantity: true,
						product: {
							id: true,
							title: true,
						},
					},
				},
				order,
				skip: offset,
				take: limit,
			});
		} catch (error) {
			throw error.message;
		}
	}

	async findRefundById(refundId: number) {
		try {
			return await this.findOne({
				where: {
					id: refundId.toString(),
					deletedAt: null,
				},
				relations: ["transaction", "items", "items.product"],
				select: {
					transaction: {
						id: true,
						totalValue: true,
						totalCost: true,
						status: true,
						salesTaxRate: true,
						paymentType: true,
						type: true,
						note: true,
						transactionDate: true,
					},
					items: {
						id: true,
						quantity: true,
						product: {
							id: true,
							title: true,
						},
					},
				},
			});
		} catch (error) {
			throw error;
		}
	}
}
