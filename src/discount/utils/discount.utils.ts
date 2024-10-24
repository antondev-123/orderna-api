import { ConflictException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as moment from 'moment';
import { discountResponseMessage, errorResponseMessage, storeResponseMessage } from "src/common/constants/response-messages/";
import { createSuccessResponse } from "src/common/utils/response.util";
import { Store } from "src/store/entities/store.entity";
import { Between, Brackets, In, IsNull, Not, Repository, SelectQueryBuilder } from "typeorm";
import { CheckDiscountDto } from "../dtos/check-discount.dto";
import { PropertiesDiscountDto } from "../dtos/properties-discount.dto";
import { StoreDiscountDto } from "../dtos/store-discount.dto";
import { DiscountStoreEntity } from "../entities/discount-stores.entity";
import { DiscountTransactionEntity } from "../entities/discount-transactions.entity";
import { DiscountEntity } from "../entities/discount.entity";
import { DiscountStatus } from "../enums/discount-status.enum";
import { OptDiscountRangeDate, OptDiscountStatus, OptDiscountType } from "./discount-enum.utils";

@Injectable()
export class DiscountUtils {
	constructor(
		@InjectRepository(DiscountEntity)
		private discountRepository: Repository<DiscountEntity>,
		@InjectRepository(DiscountStoreEntity)
		private discountStoreRepository: Repository<DiscountStoreEntity>,
		@InjectRepository(Store)
		private storeRepository: Repository<Store>,
		@InjectRepository(DiscountTransactionEntity)
		private discountTransactionRepository: Repository<DiscountTransactionEntity>,
	) { }

	async discountFilterUtils(
		queryBuilder: SelectQueryBuilder<any>,
		search: string,
		date: string = 'alltime',
		storeId: number,
		status: string,
		sortby: string,
		limit: number,
		page: number
	) {
		// Query => search
		if (search) {
			queryBuilder.andWhere(
				new Brackets(qb => {
					qb.where('discountName LIKE :search', { search: `%${search}%` })
						.orWhere('discountCode LIKE :search', { search: `%${search}%` });
				})
			);
		}

		// Query => storeId
		if (storeId) {
			const discountStores = await this.discountStoreRepository.find({
				where: {
					storeId: storeId,
					deletedAt: IsNull()
				}
			})
			if (discountStores.length > 0) {
				const discountIds = discountStores.map(item => item.discountId)
				await this.discountStoreRepository.createQueryBuilder('createQueryBuilder')
					.andWhere('discountStores.discountId IN(:...discountIds)', { discountIds });

			}
		}
		// Query date payload
		let startDate: string;
		let endDate: string;
		switch (date) {
			case 'today':
				startDate = moment().startOf('day').format('YYYY-MM-DD');
				endDate = moment().endOf('day').format('YYYY-MM-DD');
				break;
			case 'last7days':
				startDate = moment().subtract(7, 'days').startOf('day').format('YYYY-MM-DD');
				endDate = moment().endOf('day').format('YYYY-MM-DD');
				break;
			case 'lastmonth':
				startDate = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
				endDate = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
				break;
			case 'lastyear':
				startDate = moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
				endDate = moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD');
				break;
			case 'alltime':
				startDate = moment('2000-01-01').format('YYYY-MM-DD');
				endDate = moment().endOf('day').format('YYYY-MM-DD');
				break;
		}

		// Query => date
		if (date !== 'alltime') {
			queryBuilder.andWhere('DATE(createdAt) BETWEEN :startDate AND :endDate', { startDate, endDate });
		}

		// Query => status
		if (status) {
			queryBuilder.andWhere('discountStatus = :discountStatus', { discountStatus: status });
		}

		// Query => sortby
		if (sortby && sortby !== 'totalUsed') {
			queryBuilder.orderBy(`discounts.${sortby}`, 'ASC');
		} else {
			queryBuilder.orderBy('discounts.discountId', 'DESC');
		}

		// Pagination
		const offset = (page - 1) * limit;
		queryBuilder.skip(offset).take(limit);

		return queryBuilder;
	}
	async checkAvailableStore(storeIds: number[]): Promise<StoreDiscountDto[] | any> {
		try {
			const getStore = await this.storeRepository.find({
				where: {
					id: In(storeIds),
				}
			})

			if (getStore.length === 0) {
				return createSuccessResponse(
					HttpStatus.NOT_FOUND,
					{},
					storeResponseMessage.STORE_NOT_FOUND,
				);
			}

			return getStore.map(item => ({
				storeId: item.id,
				storeName: item.Name
			}))
		} catch (error) {
			throw error;
		}
	}
	async checkDiscountCode(discountCode: string, discountId: number = null) {
		try {
			const whereQuery = {
				discountCode: discountCode,
				deletedAt: IsNull(),
			}

			if (discountId) {
				Object.assign(whereQuery, {
					discountId: Not(discountId)
				})
			}

			const checkData = await this.discountRepository.findOne({
				where: whereQuery
			})

			if (checkData) {
				throw new ConflictException(
					discountResponseMessage.DUPLICATE_MSG_CODE.EN,
					errorResponseMessage.CONFLICT.EN
				);
			}
		} catch (error) {
			throw error;
		}
	}
	async responseDiscounts(sortby: string, page: number, limit: number, dataLength: number, data: any[], dataTotal: number) {
		try {
			if (sortby === 'totalUsed') {
				data.sort((a, b) => b.totalUsed - a.totalUsed);
			}

			const meta = {
				limit,
				page,
				nextPage: page < Math.ceil(dataTotal / limit) ? page + 1 : null,
				prevPage: page > 1 ? page - 1 : null,
				total: dataTotal,
				from: (page - 1) * limit + 1,
				to: (page - 1) * limit + dataLength,
			};

			const getStores = await this.storeRepository.find({
				where: {
					deletedAt: IsNull()
				}
			})

			const activeCount = await this.discountRepository.count({ where: { discountStatus: DiscountStatus.ACTIVE, deletedAt: IsNull() } });
			const expiredCount = await this.discountRepository.count({ where: { discountStatus: DiscountStatus.EXPIRED, deletedAt: IsNull() } });
			const archivedCount = await this.discountRepository.count({ where: { discountStatus: DiscountStatus.ARCHIVED, deletedAt: IsNull() } });
			const scheduledCount = await this.discountRepository.count({ where: { discountStatus: DiscountStatus.SCHEDULED, deletedAt: IsNull() } });

			const properties: PropertiesDiscountDto = {
				status: {
					allCount: dataTotal,
					activeCount,
					expiredCount,
					archivedCount,
					scheduledCount,
				},
				stores: getStores.length === 0 ? [] : getStores.map(item => ({ id: item.id, name: item.Name })),
				dates: OptDiscountRangeDate,
				discountStatus: OptDiscountStatus,
				discountType: OptDiscountType
			}

			return {
				data: data,
				meta,
				properties
			}
		} catch (error) {
			throw error;
		}
	}
	async checkDiscountAvailable(data: CheckDiscountDto): Promise<any> {
		try {
			// get discount
			const queryGetDiscount = this.discountStoreRepository.createQueryBuilder('discountStore')
				.leftJoinAndSelect('discountStore.discount', 'discount')
				.where('discountStore.storeId = :storeId', { storeId: data.storeId })
				.andWhere('discountStore.deletedAt IS NULL')
				.andWhere(`discountStore.discountStatus = 'active'`)
				.andWhere('discount.discountCode = :discountCode', { discountCode: data.discountCode })
			const getDiscountStore = await queryGetDiscount.getOne()

			// check available discount by storeId and discountCode
			if (!getDiscountStore) {
				throw new NotFoundException(
					discountResponseMessage.DISCOUNT_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			const getDiscount = getDiscountStore?.discount

			// check expired
			const checkExpired = moment(getDiscount.endDate);

			if (checkExpired.isBefore(moment(), 'day')) {
				throw new NotFoundException(
					discountResponseMessage.DISCOUNT_MSG_UNAVAILABLE_EXPIRED.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			// check amount (minimumSpend)
			if (data.amount < getDiscount.minimumSpend) {
				throw new NotFoundException(
					discountResponseMessage.DISCOUNT_MSG_UNAVAILABLE_MINIUM_SPEND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			// count discountTransactions
			const getDiscountTransaction = await this.discountTransactionRepository.find({
				where: {
					deletedAt: IsNull(),
					discountId: getDiscount.discountId
				}
			})

			// check quota discount overall
			if (getDiscount.limitOverall > 0 && getDiscountTransaction.length >= getDiscount.limitOverall) {
				throw new NotFoundException(
					discountResponseMessage.DISCOUNT_MSG_UNAVAILABLE_LIMIT_OVERALL,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			// check quota discount per customer
			const checkTotalUserPerPerson = getDiscountTransaction.filter(
				item => item.discountId === getDiscount.discountId
					&& item.customerId === data.customerId
			)

			if (checkTotalUserPerPerson.length > getDiscount.limitCustomer) {
				throw new NotFoundException(
					discountResponseMessage.DISCOUNT_MSG_UNAVAILABLE_LIMIT_PER_CUSTOMER.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}

			const discountAmount = data.amount * getDiscount.discountValue / 100
			const payload = {
				discountId: getDiscount.discountId,
				discountName: getDiscount.discountName,
				discountType: getDiscount.discountType,
				minimumSpend: getDiscount.minimumSpend,
				totalAmount: data.amount,
				discountRate: getDiscount.discountValue,
				discountValue: discountAmount,
				finalAmount: data.amount - discountAmount
			}

			return payload;
		} catch (error) {
			throw error;
		}
	}
	async updateDiscountStores(discountId: number, newStoreIds: number[], discountStatus: DiscountStatus): Promise<void> {
		try {
			// check existing stores
			const existingDiscountStores = await this.discountStoreRepository.find({
				where: {
					discountId: discountId,
					deletedAt: IsNull(),
				},
			});

			const discountStoreIdSet = new Set(existingDiscountStores.map(item => item.storeId));
			const storeIdSet = new Set(newStoreIds);

			const newIds = [];
			const removeDiscountStores = [];

			newStoreIds.forEach(storeId => {
				if (!discountStoreIdSet.has(storeId)) {
					newIds.push(storeId);
				}
			});

			existingDiscountStores.forEach(item => {
				if (!storeIdSet.has(item.storeId)) {
					removeDiscountStores.push(item);
				}
			});

			// commit remove discountStores
			const propsRemoveDiscountStores = removeDiscountStores.map(item => ({
				...item,
				deletedAt: new Date(),
			}));
			await this.discountStoreRepository.save(propsRemoveDiscountStores);

			// commit new discountStores
			const getStores = await this.checkAvailableStore(newIds);
			if (getStores.length >= 1) {
				const propsDiscountStoresPayload = getStores.map((item: StoreDiscountDto) => ({
					...item,
					discountId: discountId,
					discountStatus: discountStatus
				}))
				const discountStoresPayload = this.discountStoreRepository.create(propsDiscountStoresPayload);
				await this.discountStoreRepository.save(discountStoresPayload);
			}
		} catch (error) {
			throw error;
		}
	}
	async responseSummaryDiscount(getStartDate: string, getEndDate: string, discountId?: number) {
		try {
			const startDate = getStartDate
				? moment(getStartDate).startOf('day').toDate()
				: moment().startOf('day').toDate();
			const endDate = getEndDate
				? moment(getEndDate).endOf('day').toDate()
				: moment().endOf('day').toDate();

			const whereQuery = { createdAt: Between(startDate, endDate) }
			if (discountId) {
				Object.assign(whereQuery, { ...whereQuery, discountId: discountId })
			}

			const data = await this.discountTransactionRepository.find({
				where: whereQuery,
				order: {
					createdAt: 'DESC',
				},
			});

			const groupedData = data.reduce((acc, transaction) => {
				const date = moment(transaction.createdAt).format('YYYY-MM-DD');

				if (!acc[date]) {
					acc[date] = [];
				}
				acc[date].push(transaction);
				return acc;
			}, {});

			const summary = Object.keys(groupedData).map(date => {
				const transactions = groupedData[date];
				const total_redeemed_discounts = transactions.length;
				const total_redeemed_value = transactions.reduce((sum: number, transaction: { amount: number; }) => sum + transaction.amount, 0);
				const total_redeemed_average_value = total_redeemed_value / total_redeemed_discounts;

				return {
					period: date,
					total_redeemed_discounts,
					total_redeemed_value,
					total_redeemed_average_value: Number(total_redeemed_average_value.toFixed(2)),
				};
			});

			const total = summary.reduce((totals, daySummary) => {
				totals.total_redeemed_discounts += daySummary.total_redeemed_discounts;
				totals.total_redeemed_value += daySummary.total_redeemed_value;
				return totals;
			}, {
				total_redeemed_discounts: 0,
				total_redeemed_value: 0
			});

			const overall_total_redeemed_average_value = total.total_redeemed_discounts > 0
				? Number((total.total_redeemed_value / total.total_redeemed_discounts).toFixed(2))
				: 0;

			const response = {
				total: {
					period: `${moment(startDate).format('YYYY-MM-DD')} - ${moment(endDate).format('YYYY-MM-DD')}`,
					...total,
					total_redeemed_average_value: overall_total_redeemed_average_value
				},
				summary
			}

			if (discountId) {
				const stores = await this.discountStoreRepository.find({
					where: {
						discountId: discountId,
						deletedAt: IsNull()
					},
					order: {
						storeName: 'ASC'
					}
				})
				Object.assign(response, {
					...response,
					stores: stores.map(item => ({ storeId: item.storeId, storeName: item.storeName }))
				})
			}

			return response
		} catch (error) {
			throw error;
		}
	}
}