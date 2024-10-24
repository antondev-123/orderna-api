import { Test, TestingModule } from "@nestjs/testing";
import { RefundService } from "./refund.service";
import { DataSource } from "typeorm";
import { TransactionRepository } from "../transaction/repositories/transaction.repository";
import { RefundRepository } from "./respositories/refund.repository";
import { RefundItemsRepository } from "./respositories/refund-items.repository";
import { NotFoundException, UnprocessableEntityException } from "@nestjs/common";

describe("RefundService", () => {
	let service: RefundService;
	let refundRepository: RefundRepository;
	let refundItemsRepository: RefundItemsRepository;
	let transactionRepository: TransactionRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RefundService,
				{
					provide: TransactionRepository,
					useValue: {
						findTransactionById: jest.fn(),
						updateTransactionItems: jest.fn(),
						updateTransaction: jest.fn(),
					},
				},
				{
					provide: RefundRepository,
					useValue: {
						findQuantityRefundToday: jest.fn(),
						save: jest.fn(),
						count: jest.fn(),
						findRefundList: jest.fn(),
						findRefundById: jest.fn(),
					},
				},
				{
					provide: RefundItemsRepository,
					useValue: {
						save: jest.fn(),
					},
				},
				{
					provide: DataSource,
					useValue: {
						createQueryRunner: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<RefundService>(RefundService);
		transactionRepository = module.get<TransactionRepository>(TransactionRepository);
		refundRepository = module.get<RefundRepository>(RefundRepository);
		refundItemsRepository = module.get<RefundItemsRepository>(RefundItemsRepository);
	});

	describe("create", () => {
		it("should throw unprocessable entity exception when transaction fails", async () => {
			const createRefundDto = {
				transactionId: 1,
				items: [
					{
						productId: 1,
						quantity: 1,
					},
				],
				refundReason: "test",
			};

			transactionRepository.findTransactionById = jest
				.fn()
				.mockResolvedValue({ status: "approved", transactionItems: [{ product: { id: 1 }, remainingQuantity: 1, remainingAmount: 50 }] });
			refundRepository.findQuantityRefundToday = jest.fn().mockResolvedValue(1);

			jest.spyOn(refundRepository, "save").mockResolvedValue({} as any);
			transactionRepository.updateTransactionItems = jest.fn().mockResolvedValue({});
			refundItemsRepository.save = jest.fn().mockResolvedValue({});
			transactionRepository.updateTransaction = jest.fn().mockRejectedValue(new Error("Transaction failed"));

			await expect(service.create(createRefundDto)).rejects.toThrow(UnprocessableEntityException);
		});

		it("should throw unprocessable entity exception when refund repository save fails", async () => {
			const createRefundDto = {
				transactionId: 1,
				items: [
					{
						productId: 1,
						quantity: 1,
					},
				],
				refundReason: "test",
			};

			transactionRepository.findTransactionById = jest
				.fn()
				.mockResolvedValue({ status: "approved", transactionItems: [{ product: { id: 1 }, remainingQuantity: 1, remainingAmount: 50 }] });
			refundRepository.findQuantityRefundToday = jest.fn().mockResolvedValue(1);

			jest.spyOn(refundRepository, "save").mockRejectedValue(new Error("Save failed"));

			await expect(service.create(createRefundDto)).rejects.toThrow(UnprocessableEntityException);
		});

		it("should throw not found exception when transaction item not found", async () => {
			const createRefundDto = {
				transactionId: 1,
				items: [
					{
						productId: 2,
						quantity: 1,
					},
				],
				refundReason: "test",
			};

			transactionRepository.findTransactionById = jest
				.fn()
				.mockResolvedValue({ status: "approved", transactionItems: [{ product: { id: 1 }, remainingQuantity: 1, remainingAmount: 50 }] });

			await expect(service.create(createRefundDto)).rejects.toThrow(NotFoundException);
		});

		it("should throw not found exception when refund item quantity is more than transaction item quantity", async () => {
			const createRefundDto = {
				transactionId: 1,
				items: [
					{
						productId: 1,
						quantity: 2,
					},
				],
				refundReason: "test",
			};

			transactionRepository.findTransactionById = jest
				.fn()
				.mockResolvedValue({ status: "approved", transactionItems: [{ product: { id: 1 }, remainingQuantity: 1, remainingAmount: 50 }] });

			await expect(service.create(createRefundDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("findAll", () => {
		it("should return refund list with correct pagination", async () => {
			const filter = { page: 1, limit: 10 };

			refundRepository.count = jest.fn().mockResolvedValue(10);
			refundRepository.findRefundList = jest.fn().mockResolvedValue([{}]);

			expect(await service.findAll(filter)).toEqual({
				refunds: [{}],
				pagination: {
					currentPage: 1,
					totalPages: 1,
				},
			});
		});

		it("should return refund list with multiple pages", async () => {
			const filter = { page: 1, limit: 5 };

			refundRepository.count = jest.fn().mockResolvedValue(15);
			refundRepository.findRefundList = jest.fn().mockResolvedValue([{}, {}, {}, {}, {}]);

			expect(await service.findAll(filter)).toEqual({
				refunds: [{}, {}, {}, {}, {}],
				pagination: {
					currentPage: 1,
					totalPages: 3,
				},
			});
		});
	});
});
