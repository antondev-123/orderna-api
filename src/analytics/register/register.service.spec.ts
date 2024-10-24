import { Test, TestingModule } from "@nestjs/testing";
import { RegisterService } from "./register.service";
import { RegisterRepository } from "./register.repository";
import { TransactionRepository } from "../../transaction/repositories/transaction.repository";
import { NotFoundException } from "@nestjs/common";
import { analyticsResponseMessage } from "../../common/constants/response-messages/analytics.response-message";
import { errorResponseMessage } from "../../common/constants";

describe("RegisterService", () => {
	let service: RegisterService;
	let registerRepository: RegisterRepository;
	let transactionRepository: TransactionRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RegisterService,
				{
					provide: RegisterRepository,
					useValue: {
						findCashRegister: jest.fn(),
					},
				},
				{
					provide: TransactionRepository,
					useValue: {
						summaryTransactionByPaymentType: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<RegisterService>(RegisterService);
		registerRepository = module.get<RegisterRepository>(RegisterRepository);
		transactionRepository = module.get<TransactionRepository>(TransactionRepository);
	});

	it("should return register summary when transactions are found", async () => {
		const currentDate = new Date();
		const filterData = { page: 1, limit: 10, toDate: currentDate, fromDate: currentDate, storeId: 1 };
		const registerSummary = [
			{
				id: 1,
				createdAt: currentDate,
				registerName: "Register 1",
				opened: currentDate,
				closed: currentDate,
				store: { Name: "Store 1" },
				cashManagementEntity: [{ id: 1, cashIn: 300, cashOut: 200 }],
			},
		];
		const mockRegisterSummary = { data: registerSummary, count: 10 };
		const mockTransactionSummary = [
			{
				transactionDate: currentDate,
				cashTotal: 100,
				creditCardTotal: 200,
				debitCardTotal: 300,
				gCashTotal: 400,
				refundTotal: 500,
			},
		];

		const mockDataResult = [
			{
				id: 1,
				createdAt: currentDate,
				registerName: "Register 1",
				opened: currentDate,
				closed: currentDate,
				storeName: "Store 1",
				cash: 100,
				storeCredit: 500,
				total: 600,
			},
		];

		registerRepository.findCashRegister = jest.fn().mockResolvedValue(mockRegisterSummary);
		transactionRepository.summaryTransactionByPaymentType = jest.fn().mockResolvedValue(mockTransactionSummary);

		const result = await service.getRegisterSummary(filterData);
		expect(result).toEqual({ registerSummary: mockDataResult, pagination: { totalPages: 1, currentPage: 1 } });
	});

	it("should throw NotFoundException when no transactions are found", async () => {
		const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
		const registerSummary = [];
		const mockRegisterSummary = { data: registerSummary, count: 0 };
		registerRepository.findCashRegister = jest.fn().mockResolvedValue(mockRegisterSummary);

		await expect(service.getRegisterSummary(filterData)).rejects.toThrow(
			new NotFoundException(analyticsResponseMessage.ANALYTICS_REGISTER_SUMMARY_NOT_FOUND.EN, errorResponseMessage.NOT_FOUND.EN),
		);
	});
});
