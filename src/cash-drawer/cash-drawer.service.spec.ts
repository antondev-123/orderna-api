import { NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserRole } from "src/common/constants/enums/user-role.enum";
import { CreateUserDto } from "src/user/dtos/create.user.dto";
import { Repository } from "typeorm";
import { CashManagementRepository, CashRegisterRepository } from "./cash-drawer.repository";
import { CashDrawerService } from "./cash-drawer.service";
import { AddCashManagementDto } from "./dtos/add-cash-management.dto";
import { CloseRegisterDto } from "./dtos/close-register.dto";
import { EditCashManagementDto } from "./dtos/edit-cash-management.dto";
import { GetRegisterSummaryDto } from "./dtos/get-register-summary.dto";
import { OpenRegisterDto } from "./dtos/open-register.dto";
import { CashManagementEntity } from "./entities/cash-management.entity";
import { CashRegisterEntity } from "./entities/cash-register.entity";

describe("CashDrawerService", () => {
	let cashDrawerService: CashDrawerService;
	let cashRegisterEntity: Repository<CashRegisterEntity>;
	let cashRegisterRepository: CashRegisterRepository;
	let cashManagementEntity: Repository<CashManagementEntity>;
	let cashManagementRepository: CashManagementRepository;
	let createUserDto: Partial<CreateUserDto>;
	let tokenPayload: any;

	function createRandomString(length: number): string {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	function generateRandomMobileNumber() {
		const prefix = "9";
		let number = prefix;
		for (let i = 0; i < 9; i++) {
			const digit = Math.floor(Math.random() * 10);
			number += digit;
		}
		return number;
	}

	function generateRandomEmail() {
		const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
		const usernameLength = 10;
		let username = "";
		for (let i = 0; i < usernameLength; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			username += characters[randomIndex];
		}
		return `${username}@test.com`;
	}

	beforeEach(async () => {
		createUserDto = {
			firstName: createRandomString(10),
			lastName: createRandomString(10),
			mobile: { countryCode: '+63', number: generateRandomMobileNumber() },
			email: generateRandomEmail(),
			role: UserRole.ADMIN,
		};

		tokenPayload = {
			object: { id: 1, ...createUserDto },
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CashDrawerService,
				{
					provide: JwtService,
					useValue: {
						sign: jest.fn(),
						verify: jest.fn(),
						decode: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(CashRegisterEntity),
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						find: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(CashRegisterRepository),
					useValue: {
						findCashRegisterList: jest.fn(),
						findCashRegisterById: jest.fn(),
						save: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(CashManagementEntity),
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						find: jest.fn(),
					},
				},
				{
					provide: getRepositoryToken(CashManagementRepository),
					useValue: {
						findCashManagementById: jest.fn(),
						save: jest.fn(),
						create: jest.fn(),
						createQueryBuilder: jest.fn(() => ({
							where: jest.fn(),
							andWhere: jest.fn(),
							getOne: jest.fn(),
						})),
					},
				},
			],
		}).compile();

		cashDrawerService = module.get<CashDrawerService>(CashDrawerService);
		cashRegisterEntity = module.get<Repository<CashRegisterEntity>>(getRepositoryToken(CashRegisterEntity));
		cashRegisterRepository = module.get<CashRegisterRepository>(getRepositoryToken(CashRegisterRepository));
		cashManagementEntity = module.get<Repository<CashManagementEntity>>(getRepositoryToken(CashManagementEntity));
		cashManagementRepository = module.get<CashManagementRepository>(getRepositoryToken(CashManagementRepository));
	});

	it("should be defined", () => {
		expect(cashDrawerService).toBeDefined();
	});

	describe("openRegister", () => {
		it("should add a new register successfully", async () => {
			const openRegisterDto: OpenRegisterDto = {
				storeId: "1",
				opened: "01/01/2023 10:00 AM",
				amount: 100,
				openNote: "Register opened for the morning shift",
			};
			(cashRegisterEntity.create as jest.Mock).mockReturnValue(openRegisterDto);
			(cashRegisterEntity.save as jest.Mock).mockResolvedValue(openRegisterDto);

			const result = await cashDrawerService.openRegister(openRegisterDto, tokenPayload);
			expect(result).toEqual(openRegisterDto);
		});
	});

	describe("getRegisterSummary", () => {
		it("should return register summary successfully", async () => {
			const getRegisterSummaryDto: GetRegisterSummaryDto = {
				page: 1,
				size: 10,
			};

			const mockRegisters = [
				{
					id: 1,
					userId: 1,
					opened: "01/01/2023 10:00 AM",
					amount: 100,
					openNote: "Register 1",
				},
				{
					id: 2,
					userId: 2,
					opened: "01/02/2023 11:00 AM",
					amount: 150,
					openNote: "Register 2",
				},
			];
			const mockTotal = mockRegisters.length;

			(cashRegisterRepository.findCashRegisterList as jest.Mock).mockResolvedValue([mockRegisters, mockTotal]);

			const result = await cashDrawerService.getRegisterSummary(getRegisterSummaryDto);
			expect(result).toEqual({ getRegister: mockRegisters, total_record: mockTotal });
		});

		it("should return empty list if no registers found", async () => {
			const getRegisterSummaryDto: GetRegisterSummaryDto = {
				page: 1,
				size: 10,
			};

			(cashRegisterRepository.findCashRegisterList as jest.Mock).mockResolvedValue([[], 0]);

			const result = await cashDrawerService.getRegisterSummary(getRegisterSummaryDto);
			expect(result).toEqual({ getRegister: [], total_record: 0 });
		});
	});

	describe("closeRegister", () => {
		it("should close a register successfully", async () => {
			const registerId: number = 1;
			const closeRegisterDto: CloseRegisterDto = {
				closed: "01/01/2023 10:00 PM",
				closeNote: "Register closed for the night shift",
				counted: 100,
			};

			const mockRegister = {
				id: 1,
				userId: 1,
				opened: "01/01/2023 10:00 AM",
				amount: 100,
				openNote: "Register opened for the morning shift",
			};

			(cashRegisterRepository.findCashRegisterById as jest.Mock).mockResolvedValue(mockRegister);
			(cashRegisterRepository.save as jest.Mock).mockResolvedValue({
				...mockRegister,
				...closeRegisterDto,
			});

			const result = await cashDrawerService.closeRegister(registerId, closeRegisterDto);
			expect(result).toEqual({ ...mockRegister, ...closeRegisterDto });
		});

		it("should return not found if register does not exist", async () => {
			const registerId: number = 1;
			const closeRegisterDto: CloseRegisterDto = {
				closed: "01/01/2023 10:00 PM",
				closeNote: "Register closed for the night shift",
				counted: 100,
			};

			(cashRegisterRepository.findCashRegisterById as jest.Mock).mockResolvedValue(null);

			await expect(cashDrawerService.closeRegister(registerId, closeRegisterDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("getRegisterSummaryDetails", () => {
		it("should return register summary details successfully", async () => {
			const registerId: number = 1;
			const mockRegister = {
				id: 1,
				userId: 1,
				opened: "01/01/2023 10:00 AM",
				amount: 100,
				openNote: "Register opened for the morning shift",
			};

			(cashRegisterRepository.findCashRegisterById as jest.Mock).mockResolvedValue(mockRegister);

			const result = await cashDrawerService.getRegisterSummaryDetails(registerId);
			expect(result).toEqual(mockRegister);
		});

		it("should return not found if register summary does not exist", async () => {
			const registerId: number = 1;
			(cashRegisterRepository.findCashRegisterById as jest.Mock).mockResolvedValue(null);

			await expect(cashDrawerService.getRegisterSummaryDetails(registerId)).rejects.toThrow(NotFoundException);
		});
	});

	describe("addCashManagement", () => {
		it("should add cash management successfully", async () => {
			const registerId: number = 1;
			const addCashManagementDto: AddCashManagementDto = {
				cashIn: 100.5,
				note: "This is a note for the cash management entry.",
			};

			(cashManagementEntity.create as jest.Mock).mockReturnValue(addCashManagementDto);
			(cashManagementEntity.save as jest.Mock).mockResolvedValue(addCashManagementDto);

			const result = await cashDrawerService.addCashManagement(addCashManagementDto, registerId);
			expect(result).toEqual(addCashManagementDto);
		});
	});

	describe("editCashManagement", () => {
		it("should edit cash management successfully", async () => {
			const registerId: number = 1;
			const cashManagementId: number = 1;
			const editCashManagementDto: EditCashManagementDto = {
				cashIn: 100.5,
				cashOut: 50,
				note: "This is a note for the cash management entry.",
				isExpense: "check",
			};

			(cashManagementRepository.createQueryBuilder as jest.Mock).mockImplementation(() => ({
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getOne: jest.fn().mockResolvedValue(editCashManagementDto),
			}));
			(cashManagementRepository.save as jest.Mock).mockResolvedValue(editCashManagementDto);

			const result = await cashDrawerService.editCashManagement(registerId, cashManagementId, editCashManagementDto);
			expect(result).toEqual(editCashManagementDto);
		});

		it("should return not found if cash management does not exist", async () => {
			const registerId: number = 1;
			const cashManagementId: number = 1;
			const editCashManagementDto: EditCashManagementDto = {
				cashIn: 100.5,
				cashOut: 50,
				note: "This is a note for the cash management entry.",
				isExpense: "check",
			};

			// (
			// 	cashManagementRepository.findCashManagementById as jest.Mock
			// ).mockResolvedValue(null);

			(cashManagementRepository.createQueryBuilder as jest.Mock).mockImplementation(() => ({
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				getOne: jest.fn().mockResolvedValue(null),
			}));

			await expect(cashDrawerService.editCashManagement(registerId, cashManagementId, editCashManagementDto)).rejects.toThrow(NotFoundException);
		});
	});
});
