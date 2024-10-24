import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as moment from 'moment';
import { discountResponseMessage, storeResponseMessage } from 'src/common/constants';
import { CustomerEntity } from 'src/customer/customer.entity';
import { Store } from 'src/store/entities/store.entity';
import { TransactionEntity } from 'src/transaction/entities/transaction.entity';
import { Repository } from 'typeorm';
import { DiscountService } from './discount.service';
import { FilterDetailDiscountSummaryDto } from './dtos/filter-detail-discount-summary.dto';
import { FilterDiscountDto } from './dtos/filter-discount.dto';
import { DiscountStoreEntity } from './entities/discount-stores.entity';
import { DiscountTransactionEntity } from './entities/discount-transactions.entity';
import { DiscountEntity } from './entities/discount.entity';
import { DiscountRangeDate } from './enums/discount-rangedate.enum';
import { DiscountSortBy } from './enums/discount-sortby.enum';
import { DiscountStatus } from './enums/discount-status.enum';
import { DiscountType } from './enums/discount-type.enum';
import { DiscountUtils } from './utils/discount.utils';

const mockDiscountEntity = {
    discountId: 1,
    discountCode: 'CODE123',
    discountName: 'Discount 1',
    discountType: DiscountType.ALL_ITEMS,
    discountValue: 10,
    minimumSpend: 10,
    limitOverall: 50,
    limitCustomer: 5,
    discountStatus: DiscountStatus.ACTIVE,
    startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
    endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
};

const mockDiscountStores = {
    discountStoreId: 1,
    discountId: 1,
    storeId: 1,
    storeName: 'SuperMart 1',
    discountStatus: DiscountStatus.ACTIVE,
    discount: mockDiscountEntity
}

const mockStoreEntity = [
    {
        Name: "SuperMart 1",
        Location: "Downtown",
        Currency: "USD",
        About: "A store that offers a variety of products at great prices.",
        Email: "info1@supermart.com",
        PhoneNumber: "1234567891",
        Website: "https://supermart.com",
        StreetAddress: "123 Market Street",
        BuildingNameNumber: "Building 4",
        City: "Metropolis",
        ZipCode: "54321",
        VATNumber: "VAT123456",
        IsOpen: true,
        id: 1,
        createdAt: "2024-07-23T08:03:00.000Z",
        updatedAt: "2024-07-23T08:03:00.000Z",
        deletedAt: null
    },
    {
        Name: "SuperMart 2",
        Location: "Downtown",
        Currency: "USD",
        About: "A store that offers a variety of products at great prices.",
        Email: "info1@supermart.com",
        PhoneNumber: "1234567891",
        Website: "https://supermart.com",
        StreetAddress: "123 Market Street",
        BuildingNameNumber: "Building 4",
        City: "Metropolis",
        ZipCode: "54321",
        VATNumber: "VAT123456",
        IsOpen: true,
        id: 2,
        createdAt: "2024-07-23T08:03:00.000Z",
        updatedAt: "2024-07-23T08:03:00.000Z",
        deletedAt: null
    }
]

const mockDiscountTransaction = {
    discountTransactionId: 1,
    transactionId: 1,
    customerId: 1,
    customerName: 'Test 1',
    discountId: 1,
    storeId: 1,
    storeName: 'SuperMart 1',
    amount: 1000,
    discountValue: 10,
    discountCode: 'CODE123',
    discountName: 'Discount 1',
    discountType: DiscountType.ALL_ITEMS,
    createdAt: moment().format('YYYY-MM-DD'),
    discount: mockDiscountEntity
}

const mockCustomerEntity = {
    store: 1,
    firstName: "Jem",
    lastName: "Kim",
    mobilePhone: "9988776654"
}

describe('DiscountService', () => {
    let discountService: DiscountService;
    let discountUtils: DiscountUtils;
    let discountStoreRepository: Repository<DiscountStoreEntity>;
    let discountRepository: Repository<DiscountEntity>;
    let storeRepository: Repository<Store>;
    let discountTransactionRepository: Repository<DiscountTransactionEntity>;
    let customerRepository: Repository<CustomerEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DiscountService,
                {
                    provide: getRepositoryToken(DiscountEntity),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockDiscountEntity),
                        save: jest.fn().mockResolvedValue(mockDiscountEntity),
                        create: jest.fn().mockReturnValue(mockDiscountEntity),
                        find: jest.fn().mockResolvedValue([mockDiscountEntity]),
                        update: jest.fn().mockReturnValue(mockDiscountEntity),
                        count: jest.fn().mockResolvedValue(mockDiscountEntity),
                        createQueryBuilder: jest.fn().mockReturnValue({
                            where: jest.fn().mockReturnThis(),
                            andWhere: jest.fn().mockReturnThis(),
                            orderBy: jest.fn().mockReturnThis(),
                            skip: jest.fn().mockReturnThis(),
                            take: jest.fn().mockReturnThis(),
                            getManyAndCount: jest.fn().mockResolvedValue([[mockDiscountEntity], 1]),
                        }),
                    },
                },
                DiscountUtils,
                {
                    provide: getRepositoryToken(DiscountEntity),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockDiscountEntity),
                        save: jest.fn().mockResolvedValue(mockDiscountEntity),
                        create: jest.fn().mockReturnValue(mockDiscountEntity),
                        find: jest.fn().mockResolvedValue([mockDiscountEntity]),
                        update: jest.fn().mockReturnValue(mockDiscountEntity),
                        count: jest.fn().mockResolvedValue(mockDiscountEntity),
                        createQueryBuilder: jest.fn().mockReturnValue({
                            where: jest.fn().mockReturnThis(),
                            andWhere: jest.fn().mockReturnThis(),
                            orderBy: jest.fn().mockReturnThis(),
                            skip: jest.fn().mockReturnThis(),
                            take: jest.fn().mockReturnThis(),
                            leftJoinAndSelect: jest.fn().mockReturnThis(),
                            getOne: jest.fn().mockReturnThis(),
                            getManyAndCount: jest.fn().mockResolvedValue([[mockDiscountEntity], 1]),
                        }),
                    },
                },
                {
                    provide: getRepositoryToken(DiscountStoreEntity),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockDiscountStores),
                        save: jest.fn(),
                        create: jest.fn(),
                        find: jest.fn().mockResolvedValue([mockDiscountStores]),
                        createQueryBuilder: jest.fn().mockReturnValue({
                            queryGetDiscount: jest.fn().mockReturnThis(),
                            where: jest.fn().mockReturnThis(),
                            andWhere: jest.fn().mockReturnThis(),
                            orderBy: jest.fn().mockReturnThis(),
                            skip: jest.fn().mockReturnThis(),
                            take: jest.fn().mockReturnThis(),
                            leftJoinAndSelect: jest.fn().mockReturnThis(),
                            getOne: jest.fn().mockResolvedValue({ ...mockDiscountStores, discount: mockDiscountEntity }),
                            getManyAndCount: jest.fn().mockResolvedValue([[mockDiscountStores], 1]),
                        }),
                    },
                },
                {
                    provide: getRepositoryToken(DiscountTransactionEntity),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockDiscountTransaction),
                        save: jest.fn(),
                        create: jest.fn(),
                        find: jest.fn().mockResolvedValue([mockDiscountTransaction]),
                    },
                },
                {
                    provide: getRepositoryToken(Store),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockStoreEntity),
                        save: jest.fn().mockResolvedValue(mockStoreEntity),
                        create: jest.fn().mockReturnValue(mockStoreEntity),
                        find: jest.fn().mockResolvedValue(mockStoreEntity),
                    },
                },
                {
                    provide: getRepositoryToken(TransactionEntity),
                    useValue: {
                        save: jest.fn(),
                        create: jest.fn(),
                        find: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(CustomerEntity),
                    useValue: {
                        save: jest.fn(),
                        create: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn().mockResolvedValue(mockCustomerEntity),
                    },
                },
            ],
        }).compile();

        discountService = module.get<DiscountService>(DiscountService);
        discountUtils = module.get<DiscountUtils>(DiscountUtils);
        discountRepository = module.get<Repository<DiscountEntity>>(getRepositoryToken(DiscountEntity));
        storeRepository = module.get<Repository<Store>>(getRepositoryToken(Store));
        discountTransactionRepository = module.get<Repository<DiscountTransactionEntity>>(getRepositoryToken(DiscountTransactionEntity));
        discountStoreRepository = module.get<Repository<DiscountStoreEntity>>(getRepositoryToken(DiscountStoreEntity));
        customerRepository = module.get<Repository<CustomerEntity>>(getRepositoryToken(CustomerEntity));

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addDiscount', () => {
        it(`validation => ${discountResponseMessage.DUPLICATE_MSG_CODE.EN}`, async () => {
            discountRepository.findOne = jest.fn().mockResolvedValue(mockDiscountEntity);
            discountRepository.create = jest.fn().mockReturnValue(mockDiscountEntity);
            discountRepository.save = jest.fn().mockResolvedValue(mockDiscountEntity);

            const discountDto = {
                discountCode: 'CODE123',
                discountName: 'Discount 1',
                storeIds: [1],
                discountType: DiscountType.ALL_ITEMS,
                discountValue: 10,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5,
                discountStatus: DiscountStatus.ACTIVE,
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
            };
            await expect(discountService.addDiscount(discountDto)).rejects.toThrow(ConflictException);
        });

        it(`validation => ${storeResponseMessage.STORE_NOT_FOUND.EN}`, async () => {
            // Setup
            storeRepository.find = jest.fn().mockResolvedValue([]);

            discountRepository.findOne = jest.fn().mockResolvedValue(null);
            discountRepository.create = jest.fn().mockReturnValue(mockDiscountEntity);
            discountRepository.save = jest.fn().mockResolvedValue(mockDiscountEntity);

            // Method
            const discount = await discountService.addDiscount({
                discountCode: 'CODE123',
                discountName: 'Discount 1',
                storeIds: [1],
                discountType: DiscountType.ALL_ITEMS,
                discountValue: 10,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5,
                discountStatus: DiscountStatus.ACTIVE,
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
            });

            // Assertion
            expect(discount.message[0]).toEqual(storeResponseMessage.STORE_NOT_FOUND.EN);
        });

        it('should add a new discount', async () => {
            // stores schema
            for (let i = 0; i < mockStoreEntity.length; i++) {
                const item = mockStoreEntity[i]

                // Setup
                storeRepository.create = jest.fn().mockReturnValue(mockStoreEntity[i]);
                storeRepository.save = jest.fn().mockResolvedValue(mockStoreEntity[i]);
                storeRepository.findOne = jest.fn().mockResolvedValue(mockStoreEntity[i]);

                // Method
                await storeRepository.findOne({ where: { id: item.id } });
                await storeRepository.save(item);

                // Assertion
                expect(storeRepository.findOne).toHaveBeenCalledWith({ where: { id: item.id } });
                expect(storeRepository.save).toHaveBeenCalledWith(item);
            }

            // Setup
            discountRepository.findOne = jest.fn().mockResolvedValue(null);
            discountRepository.create = jest.fn().mockReturnValue(mockDiscountEntity);
            discountRepository.save = jest.fn().mockResolvedValue(mockDiscountEntity);

            // Method
            const discount = await discountService.addDiscount({
                discountCode: 'CODE123',
                discountName: 'Discount 1',
                storeIds: [1, 2],
                discountType: DiscountType.ALL_ITEMS,
                discountValue: 10,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5,
                discountStatus: DiscountStatus.ACTIVE,
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
            });

            // Assertion
            // expect(discount.statusCode).toEqual(HttpStatus.CREATED);
            expect(discountRepository.findOne).toHaveBeenCalled();
            expect(discountRepository.save).toHaveBeenCalledWith(mockDiscountEntity);
        });
    });

    describe('getDiscounts', () => {
        it(`should return ${discountResponseMessage.GET_DISCOUNT_LIST.EN}`, async () => {
            const query: FilterDiscountDto = {
                search: 'CODE123',
                date: DiscountRangeDate.ALL_TIME,
                storeId: 1,
                status: DiscountStatus.ACTIVE,
                sortby: DiscountSortBy.TOTAL_USED,
                limit: 10,
                page: 1,
            };

            const discount = await discountService.getDiscounts(query);

            expect(discount.data[0].discountId).toEqual(1);
            expect(discountRepository.createQueryBuilder).toHaveBeenCalled();
            expect(discountTransactionRepository.find).toHaveBeenCalled()
        });
    });

    describe('getDiscountById', () => {
        it(`should return ${discountResponseMessage.GET_DISCOUNT_DETAILS.EN}`, async () => {
            discountRepository.findOne = jest.fn().mockResolvedValue(mockDiscountEntity);
            discountRepository.create = jest.fn().mockReturnValue(mockDiscountEntity);
            discountRepository.save = jest.fn().mockResolvedValue(mockDiscountEntity);

            const discount = await discountService.getDiscountById(1);

            expect(discount.discountId).toEqual(1);
            expect(discountRepository.findOne).toHaveBeenCalled()
        });

        it(`should return ${discountResponseMessage.DISCOUNT_NOT_FOUND.EN}`, async () => {
            discountRepository.findOne = jest.fn().mockResolvedValue(null);
            discountRepository.create = jest.fn().mockReturnValue(mockDiscountEntity);
            discountRepository.save = jest.fn().mockResolvedValue(mockDiscountEntity);

            await expect(discountService.getDiscountById(99999)).rejects.toThrow(NotFoundException);
            // expect(discount.message[0]).toEqual(discountResponseMessage.DISCOUNT_NOT_FOUND.EN);
            expect(discountRepository.findOne).toHaveBeenCalled()
        });
    })

    describe('deleteDiscountById', () => {
        it(`should return ${discountResponseMessage.DELETE_DISCOUNT.EN}`, async () => {
            discountRepository.findOne = jest.fn().mockResolvedValue(mockDiscountEntity);
            discountRepository.update = jest.fn();

            const result = await discountService.deleteDiscountById(1);

            // expect(result.discountId).toEqual(1);
            expect(discountRepository.findOne).toHaveBeenCalled();
            expect(discountRepository.update).toHaveBeenCalled();
        });

        it(`should throw a ${discountResponseMessage.DISCOUNT_NOT_FOUND.EN}`, async () => {
            discountRepository.findOne = jest.fn().mockResolvedValue(null);

            await expect(discountService.deleteDiscountById(1)).rejects.toThrow(NotFoundException);
            // expect(discount.message[0]).toEqual(discountResponseMessage.DISCOUNT_NOT_FOUND.EN);
            expect(discountRepository.findOne).toHaveBeenCalled();
        });
    });

    describe('deleteDiscountBulk', () => {
        it('should bulk delete a discount by ID', async () => {
            const mockDiscounts = [
                { id: 1, discountID: 1, deletedAt: null },
                { id: 2, discountID: 2, deletedAt: null },
                { id: 3, discountID: 3, deletedAt: null }
            ];

            discountRepository.find = jest.fn().mockResolvedValue(mockDiscounts);
            discountRepository.save = jest.fn().mockResolvedValue(mockDiscounts);

            const result = await discountService.deleteDiscountByIds([1, 2, 3]);

            expect(discountRepository.find).toHaveBeenCalled();
        });

        it(`should throw a ${discountResponseMessage.DISCOUNT_NOT_FOUND.EN}`, async () => {
            discountRepository.find = jest.fn().mockResolvedValue([]);
            await expect(discountService.deleteDiscountByIds([1, 2, 3])).rejects.toThrow(NotFoundException);
            // expect(discount.message[0]).toEqual(discountResponseMessage.DISCOUNT_NOT_FOUND.EN);
            expect(discountRepository.find).toHaveBeenCalled();
        });
    });

    describe('updateDiscount', () => {
        it('should update a discount', async () => {
            const dto = {
                discountCode: 'CODE123',
                discountName: 'Discount 1',
                storeIds: [1],
                discountType: DiscountType.ALL_ITEMS,
                discountValue: 10,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5,
                discountStatus: DiscountStatus.ACTIVE,
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
            };

            discountRepository.findOne = jest.fn()
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(mockDiscountEntity);

            discountRepository.save = jest.fn().mockResolvedValue(mockDiscountEntity);

            const result = await discountService.updateDiscount(1, dto);
            // expect(result.discountId).toEqual(1);
            expect(discountRepository.findOne).toHaveBeenCalled()
        });

        it(`should throw a ${discountResponseMessage.DISCOUNT_NOT_FOUND.EN}`, async () => {
            discountRepository.findOne = jest.fn().mockResolvedValue(null);

            const dto = {
                discountCode: 'CODE123',
                discountName: 'Discount 1',
                storeIds: [1],
                discountType: DiscountType.ALL_ITEMS,
                discountValue: 10,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5,
                discountStatus: DiscountStatus.ACTIVE,
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
            };

            await expect(discountService.updateDiscount(1, dto)).rejects.toThrow(NotFoundException);
            // expect(discount.message[0]).toEqual(discountResponseMessage.DISCOUNT_NOT_FOUND.EN);
            expect(discountRepository.findOne).toHaveBeenCalled();
        });
    })

    // describe('addDiscountTransaction', () => {
    //     it('should add a discount transaction', async () => {
    //         customerRepository.findOne = jest.fn().mockResolvedValue({ where: { id: 1 } });

    //         const result = await discountService.addDiscountTransaction({
    //             discountTransactionId: 1,
    //             transactionId: 1,
    //             discountCode: 'CODE123',
    //             storeId: 1,
    //             customerId: 1,
    //             amount: 1000
    //         });

    //         expect(result.discountId).toEqual(1);
    //         expect(customerRepository.findOne).toHaveBeenCalled()
    //         expect(discountStoreRepository.createQueryBuilder).toHaveBeenCalledWith('discountStore');
    //         expect(discountStoreRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('discountStore.discount', 'discount');
    //         expect(discountStoreRepository.createQueryBuilder().where).toHaveBeenCalledWith('discountStore.storeId = :storeId', { storeId: 1 });
    //         expect(discountStoreRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith('discountStore.deletedAt IS NULL');
    //         expect(discountStoreRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith('discountStore.discountStatus = \'active\'');
    //         expect(discountStoreRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith('discount.discountCode = :discountCode', { discountCode: 'CODE123' });
    //     });
    // })

    describe('changeDiscountStatus', () => {
        it('should update a discount status', async () => {
            const dto = {
                discountCode: 'CODE1234',
                discountName: 'Discount 1',
                storeIds: [1],
                discountType: DiscountType.ALL_ITEMS,
                discountValue: 10,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5,
                discountStatus: DiscountStatus.ACTIVE,
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
            };

            discountRepository.findOne = jest.fn()
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(mockDiscountEntity);

            discountRepository.save = jest.fn().mockResolvedValue(mockDiscountEntity);

            const result = await discountService.updateDiscount(1, dto);
            // expect(result[0].discountId).toEqual(1);
            expect(discountRepository.findOne).toHaveBeenCalled()
        });
    })

    describe('discountByStoreId', () => {
        it('should get summary a discounts', async () => {
            discountStoreRepository.find = jest.fn().mockResolvedValue([mockDiscountStores])

            const result = await discountService.discountByStoreId(1);
            expect(result[0].discountId).toEqual(1);
            expect(discountStoreRepository.find).toHaveBeenCalled()
        });

        it('should get summary a discount by discountId', async () => {
            const currentDate = moment().format('YYYY-MM-DD')
            discountTransactionRepository.find = jest.fn().mockResolvedValue([mockDiscountTransaction])
            discountTransactionRepository.create = jest.fn().mockReturnValue(mockDiscountTransaction)
            discountTransactionRepository.save = jest.fn().mockResolvedValue(mockDiscountTransaction)

            const query: FilterDetailDiscountSummaryDto = {
                startDate: currentDate,
                endDate: currentDate
            }
            const result = await discountService.getDiscountSummary(query, 1);

            // expect(result.discountId).toEqual(1);
            expect(discountTransactionRepository.find).toHaveBeenCalled()
        });
    })

    describe('getDiscountSummary', () => {
        it('should get summary a discounts', async () => {
            const currentDate = moment().format('YYYY-MM-DD')
            discountTransactionRepository.find = jest.fn().mockResolvedValue([mockDiscountTransaction])
            discountTransactionRepository.create = jest.fn().mockReturnValue(mockDiscountTransaction)
            discountTransactionRepository.save = jest.fn().mockResolvedValue(mockDiscountTransaction)

            const query: FilterDetailDiscountSummaryDto = {
                startDate: currentDate,
                endDate: currentDate
            }
            const result = await discountService.getDiscountSummary(query);

            // expect(result.discountId).toEqual(1);
            expect(discountTransactionRepository.find).toHaveBeenCalled()
        });

        it('should get summary a discount by discountId', async () => {
            const currentDate = moment().format('YYYY-MM-DD')
            discountTransactionRepository.find = jest.fn().mockResolvedValue([mockDiscountTransaction])
            discountTransactionRepository.create = jest.fn().mockReturnValue(mockDiscountTransaction)
            discountTransactionRepository.save = jest.fn().mockResolvedValue(mockDiscountTransaction)

            const query: FilterDetailDiscountSummaryDto = {
                startDate: currentDate,
                endDate: currentDate
            }
            const result = await discountService.getDiscountSummary(query, 1);

            // expect(result.discountId).toEqual(1);
            expect(discountTransactionRepository.find).toHaveBeenCalled()
        });
    })



    // updateDiscount
    // updateDiscountStores
    // discountByStoreId
    // addDiscountTransaction
    // changeDiscountStatus
    // getDiscountSummary
    // checkDiscountCode (done)
    // checkAvailableStore (done)
    // checkDiscountAvailable
});
