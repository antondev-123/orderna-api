import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { FastifyReply } from 'fastify';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { AuthRedisService } from 'src/redis/services/auth-redis.service';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { CreateDiscountTransactionDto } from './dtos/create-discount-transaction.dto';
import { CreateDiscountDto } from './dtos/create-discount.dto';
import { FilterDiscountDto } from './dtos/filter-discount.dto';
import { DiscountUtils } from './utils/discount.utils';

describe('DiscountController', () => {
    let controller: DiscountController;
    let service: DiscountService;

    const mockDiscountService = {
        addDiscount: jest.fn().mockResolvedValue({}),
        getDiscounts: jest.fn().mockResolvedValue([]),
        getDiscountById: jest.fn().mockResolvedValue({}),
        updateDiscount: jest.fn().mockResolvedValue({}),
        deleteDiscountById: jest.fn().mockResolvedValue({}),
        deleteDiscountByIds: jest.fn().mockResolvedValue({}),
        addDiscountTransaction: jest.fn().mockResolvedValue({}),
        discountByStoreId: jest.fn().mockResolvedValue({}),
        checkDiscountAvailable: jest.fn().mockResolvedValue({}),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DiscountController],
            providers: [
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: AuthRedisService,
                    useValue: {
                        saveTokenToRedis: jest.fn(),
                        getTokenFromRedis: jest.fn(),
                        deleteTokenFromRedis: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                        verify: jest.fn(),
                        decode: jest.fn(),
                    },
                },
                {
                    provide: DiscountService,
                    useValue: mockDiscountService,
                },
                {
                    provide: DiscountUtils,
                    useValue: mockDiscountService,
                },
                {
                    provide: APP_INTERCEPTOR,
                    useFactory: () => new ResponseInterceptor(HttpStatus.OK, "Custom message"),
                }
            ],
        }).compile();

        controller = module.get<DiscountController>(DiscountController);
        service = module.get<DiscountService>(DiscountService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('addDiscount', () => {
        it('should add a discount', async () => {
            const dto = new CreateDiscountDto();
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            } as unknown as FastifyReply;

            await controller.addDiscount(dto);

            expect(service.addDiscount).toHaveBeenCalledWith(dto);
        });
    });

    describe('getDiscounts', () => {
        it('should return discounts', async () => {
            const filters = new FilterDiscountDto();
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            } as unknown as FastifyReply;

            await controller.getDiscounts(filters);

            expect(service.getDiscounts).toHaveBeenCalledWith(filters);
        });
    });

    describe('getDiscount', () => {
        it('should return a discount by id', async () => {
            const id = 1;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            } as unknown as FastifyReply;

            await controller.getDiscount(id);

            expect(service.getDiscountById).toHaveBeenCalledWith(id);
        });
    });

    describe('updateDiscount', () => {
        it('should update a discount', async () => {
            const id = 1;
            const dto = new CreateDiscountDto();
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            } as unknown as FastifyReply;

            await controller.updateDiscount(id, dto);

            expect(service.updateDiscount).toHaveBeenCalledWith(id, dto);
        });
    });

    describe('deleteDiscount', () => {
        it('should delete a discount by id', async () => {
            const id = 1;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            } as unknown as FastifyReply;

            await controller.deleteDiscount(id);

            expect(service.deleteDiscountById).toHaveBeenCalledWith(id);
        });
    });

    describe('deleteDiscounts', () => {
        it('should delete discounts by ids', async () => {
            const ids = [1, 2, 3];
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            } as unknown as FastifyReply;

            await controller.deleteDiscounts(ids);

            expect(service.deleteDiscountByIds).toHaveBeenCalledWith(ids);
        });
    });

    describe('addDiscountTransaction', () => {
        it('should add a discount transaction', async () => {
            const dto = new CreateDiscountTransactionDto();
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            } as unknown as FastifyReply;

            await controller.addDiscountTransaction(dto);

            expect(service.addDiscountTransaction).toHaveBeenCalledWith(dto);
        });
    });

    describe('discountsByStoreId', () => {
        it('should get discounts by storeId', async () => {
            const storeId = 1;
            const res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn().mockReturnThis(),
            } as unknown as FastifyReply;

            await controller.discountsByStoreId(storeId);

            expect(service.discountByStoreId).toHaveBeenCalledWith(storeId);
        });
    });
});
