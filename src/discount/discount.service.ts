import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { discountResponseMessage, errorResponseMessage } from 'src/common/constants/response-messages';
import { createSuccessResponse } from 'src/common/utils/response.util';
import { CustomerEntity } from 'src/customer/customer.entity';
import { Store } from 'src/store/entities/store.entity';
import { In, IsNull, Repository } from 'typeorm';
import { CreateDiscountTransactionDto } from './dtos/create-discount-transaction.dto';
import { CreateDiscountDto } from './dtos/create-discount.dto';
import { FilterDetailDiscountSummaryDto } from './dtos/filter-detail-discount-summary.dto';
import { FilterDiscountDto } from './dtos/filter-discount.dto';
import { StoreDiscountDto } from './dtos/store-discount.dto';
import { UpdateDiscountDto } from './dtos/update-discount.dto';
import { DiscountStoreEntity } from './entities/discount-stores.entity';
import { DiscountTransactionEntity } from './entities/discount-transactions.entity';
import { DiscountEntity } from './entities/discount.entity';
import { DiscountStatus } from './enums/discount-status.enum';
import { DiscountUtils } from './utils/discount.utils';

@Injectable()
export class DiscountService {
    constructor(
        private readonly discountUtils: DiscountUtils,
        @InjectRepository(DiscountEntity)
        private discountRepository: Repository<DiscountEntity>,
        @InjectRepository(DiscountStoreEntity)
        private discountStoreRepository: Repository<DiscountStoreEntity>,
        @InjectRepository(Store)
        private storeRepository: Repository<Store>,
        @InjectRepository(DiscountTransactionEntity)
        private discountTransactionRepository: Repository<DiscountTransactionEntity>,
        @InjectRepository(CustomerEntity)
        private customerRepository: Repository<CustomerEntity>
    ) { }

    async addDiscount(data: CreateDiscountDto) {
        try {
            await this.discountUtils.checkDiscountCode(data.discountCode);

            const getStores = await this.discountUtils.checkAvailableStore(data.storeIds)
            if (getStores?.statusCode === HttpStatus.NOT_FOUND) return getStores;

            // commit table discounts
            const discountPayload = this.discountRepository.create(data);
            const commitDiscount = await this.discountRepository.save(discountPayload);

            // commit table discount stores
            const propsDiscountStoresPayload = getStores.map((item: StoreDiscountDto) => ({
                ...item,
                discountId: commitDiscount.discountId,
                discountStatus: data.discountStatus
            }))
            const discountStoresPayload = this.discountStoreRepository.create(propsDiscountStoresPayload);
            await this.discountStoreRepository.save(discountStoresPayload);

            // response data
            const responseData = {
                ...data,
                stores: propsDiscountStoresPayload
            }

            return responseData;
        } catch (error) {
            throw error;
        }
    }

    async getDiscounts(query: FilterDiscountDto) {
        try {
            const { search, date, storeId, status, sortby, limit, page } = query;

            const queryBuilder = this.discountRepository.createQueryBuilder('discounts');

            await this.discountUtils.discountFilterUtils(queryBuilder, search, date, storeId, status, sortby, limit, page);

            const [results, total] = await queryBuilder.getManyAndCount();

            const totalUsed = await this.discountTransactionRepository.find({
                where: {
                    discountId: In(results.map(item => item.discountId))
                }
            })

            const newResults = results.map(item => {
                const newTotalUsed = !totalUsed || totalUsed.length === 0 ? [] : totalUsed.filter(el => el.discountId === item.discountId)

                return {
                    discountId: item.discountId,
                    discountCode: item.discountCode,
                    discountName: item.discountName,
                    totalUsed: newTotalUsed.length,
                    discountType: item.discountType,
                    discountValue: item.discountValue,
                    minimumSpend: item.minimumSpend,
                    limitCustomer: item.limitCustomer,
                    limitOverall: item.limitOverall,
                    discountStatus: item.discountStatus,
                    startDate: moment(item.startDate).format('YYYY-MM-DD'),
                    endDate: moment(item.endDate).format('YYYY-MM-DD'),
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    deletedAt: item.deletedAt
                }
            });

            const response = await this.discountUtils.responseDiscounts(sortby, page, limit, newResults.length, newResults, total)

            return response;
        } catch (error) {
            throw error;
        }
    }

    async getDiscountById(discountId: number) {
        try {
            const data = await this.discountRepository.findOne({
                where: {
                    discountId: discountId,
                    deletedAt: IsNull(),
                }
            })

            if (!data) {
                throw new NotFoundException(
                    discountResponseMessage.DISCOUNT_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                );
            }
            const discountStores = await this.discountStoreRepository.find({
                where: {
                    discountId: discountId,
                    deletedAt: IsNull(),
                }
            })
            const stores = discountStores.map(item => ({
                storeId: item.storeId,
                storeName: item.storeName,
                status: item.discountStatus
            }));

            const response = {
                discountId: data.discountId,
                discountCode: data.discountCode,
                discountName: data.discountName,
                totalUsed: (data.discountId + 1) * data.discountId,
                discountType: data.discountType,
                discountValue: data.discountValue,
                minimumSpend: data.minimumSpend,
                limitCustomer: data.limitCustomer,
                limitOverall: data.limitOverall,
                discountStatus: data.discountStatus,
                startDate: moment(data.startDate).format('YYYY-MM-DD'),
                endDate: moment(data.endDate).format('YYYY-MM-DD'),
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                deletedAt: data.deletedAt,
                stores
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    async updateDiscount(discountId: number, data: UpdateDiscountDto) {
        try {
            await this.discountUtils.checkDiscountCode(data.discountCode, discountId);

            const discount = await this.getDiscountById(discountId)
            if (!discount) {
                throw new NotFoundException(
                    discountResponseMessage.DISCOUNT_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                );
            }

            Object.assign(discount, { ...data, updatedAt: new Date() });

            // commit update table discounts
            await this.discountRepository.save(discount);

            // commit update table discountStores
            await this.discountUtils.updateDiscountStores(discountId, data.storeIds, data.discountStatus);

            return data;
        } catch (error) {
            throw error;
        }
    }

    async deleteDiscountById(discountId: number): Promise<any> {
        try {
            const response = await this.getDiscountById(discountId)
            if (!response) {
                throw new NotFoundException(
                    discountResponseMessage.DISCOUNT_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                );
            }

            await this.discountRepository.update(discountId, {
                updatedAt: new Date(),
                deletedAt: new Date()
            });

            const discountStores = await this.discountStoreRepository.find({
                where: {
                    discountId: discountId,
                    deletedAt: IsNull(),
                },
            });

            if (discountStores.length < 1) {
                throw new NotFoundException(
                    discountResponseMessage.DISCOUNT_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                );
            }

            const updatedDiscountStores = discountStores.map(item => ({
                ...item,
                updatedAt: new Date(),
                deletedAt: new Date()
            }));
            await this.discountStoreRepository.save(updatedDiscountStores);

            return null;
        } catch (error) {
            throw error;
        }
    }

    async discountByStoreId(storeId: number) {
        try {
            const discountStores = await this.discountStoreRepository.find({
                where: {
                    storeId: storeId,
                    deletedAt: IsNull(),
                },
                relations: ['discount']
            });

            const currentDatetime = moment();
            const response = discountStores.map(item => {
                const isExpired = moment(item.createdAt).isBefore(currentDatetime, 'day');

                return {
                    discountStoreId: item.discountStoreId,
                    discountId: item.discountId,
                    discountCode: item.discount.discountCode,
                    storeName: item.storeName,
                    discountName: item.discount.discountName,
                    discountType: item.discount.discountType,
                    discountStatus: isExpired ? DiscountStatus.EXPIRED : item.discountStatus,
                    discountValue: item.discount.discountValue,
                    minimumSpend: item.discount.minimumSpend,
                    limitOverall: item.discount.limitOverall,
                    limitCustomer: item.discount.limitCustomer,
                    createdAt: item.createdAt
                }
            })

            return response;
        } catch (error) {
            throw error;
        }
    }

    async addDiscountTransaction(data: CreateDiscountTransactionDto) {
        try {
            // check available discount
            const checkAvailableDiscount = await this.discountUtils.checkDiscountAvailable({
                storeId: data.storeId,
                customerId: data.customerId,
                discountCode: data.discountCode,
                amount: data.amount
            })
            if (checkAvailableDiscount?.statusCode === HttpStatus.NOT_FOUND) return checkAvailableDiscount;

            // get customer
            const customer = await this.customerRepository.findOne({
                where: {
                    id: data.customerId
                },
                relations: { contactInfo: true }
            })

            // get store
            const getStore = await this.storeRepository.findOne({
                where: {
                    id: data.storeId
                }
            })

            const payload = this.discountTransactionRepository.create({
                transactionId: data.transactionId,
                discountType: checkAvailableDiscount.data.discountType,
                customerId: data.customerId,
                customerName: `${customer.contactInfo.firstName} ${customer.contactInfo.lastName}`,
                discountId: checkAvailableDiscount.data.discountId,
                storeId: data.storeId,
                storeName: getStore.Name,
                discountCode: data.discountCode,
                discountName: checkAvailableDiscount.data.discountName,
                amount: data.amount,
                discountValue: checkAvailableDiscount.data.discountRate,
            })
            await this.discountTransactionRepository.save(payload);

            return {};
        } catch (error) {
            throw error;
        }
    }

    async changeDiscountStatus(discountId: number, discountStatus: DiscountStatus) {
        try {
            const discount = await this.getDiscountById(discountId)
            if (!discount) {
                throw new NotFoundException(
                    discountResponseMessage.DISCOUNT_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                );
            }

            Object.assign(discount, {
                ...discount,
                updatedAt: new Date(),
                discountStatus: discountStatus
            })

            await this.discountRepository.save(discount)

            return createSuccessResponse(
                HttpStatus.OK,
                { discountId, discountStatus },
                discountResponseMessage.DISCOUNT_CHANGE_STATUS,
            );
        } catch (error) {
            throw error;
        }
    }

    async getDiscountSummary(query: FilterDetailDiscountSummaryDto, discountId?: number) {
        try {
            let discount: any
            if (discountId) {
                discount = await this.getDiscountById(discountId)
                if (discount?.statusCode === HttpStatus.NOT_FOUND) return discount;
            }

            const response = await this.discountUtils.responseSummaryDiscount(query.startDate, query.endDate, discountId)

            if (discountId) {
                Object.assign(response, {
                    discount,
                    ...response
                })
            }

            return response;
        } catch (error) {
            throw error;
        }

    }

    async deleteDiscountByIds(ids: number[]) {
        try {
            const discounts = await this.discountRepository.find({
                where: {
                    discountId: In(ids),
                    deletedAt: IsNull()
                },
            });

            if (discounts.length === 0) {
                throw new NotFoundException(
                    discountResponseMessage.DISCOUNT_NOT_FOUND.EN,
                    errorResponseMessage.NOT_FOUND.EN
                );
            }

            // commit remove table discounts
            const updatedDiscounts = discounts.map(discount => ({
                ...discount,
                deletedAt: new Date(),
            }));
            await this.discountRepository.save(updatedDiscounts);

            const discountStores = await this.discountStoreRepository.find({
                where: {
                    discountId: In(ids),
                    deletedAt: IsNull(),
                },
            });

            // commit remove table discountStores
            const updatedDiscountStores = discountStores.map(discount => ({
                ...discount,
                deletedAt: new Date(),
            }));
            await this.discountStoreRepository.save(updatedDiscountStores);

            return {};
        } catch (error) {
            throw error;
        }
    }
}
