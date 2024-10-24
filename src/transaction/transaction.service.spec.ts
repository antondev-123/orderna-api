import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { PaymentType } from "src/common/constants/enums/payment-type.enum";
import { TransactionStatus } from "src/common/constants/enums/transaction-status.enum";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { CustomerEntity } from "src/customer/customer.entity";
import { CustomersRepository } from "src/customer/customer.repository";
import { ProductRepository } from "src/product/product.repository";
import { Store } from "src/store/entities/store.entity";
import { StoreRepository } from "src/store/repository/store.repository";
import { UserEntity } from "src/user/entities/user.entity";
import { UsersRepository } from "src/user/users.repository";
import { Repository } from "typeorm";
import { CreateTransactionDto } from "./dtos/create-transaction.dto";
import { ListTransactionDto } from "./dtos/list-transaction.dto";
import { TransactionIdDto } from "./dtos/params-transaction.dto";
import { TransactionItemEntity } from "./entities/transaction-item.entity";
import { TransactionEntity } from "./entities/transaction.entity";
import { TransactionItemRepository } from "./repositories/transaction-item.repository";
import { TransactionRepository } from "./repositories/transaction.repository";
import { TransactionService } from "./transaction.service";

describe("TransactionService", () => {
	let transactionService: TransactionService;
	let transactionRepository: TransactionRepository;
	let customersRepository: CustomersRepository;
	let contactInfoRepository: Repository<ContactInformationEntity>;
	let userRepository: UsersRepository;
	let storeRepository: StoreRepository;
	let productRepository: ProductRepository;
	let transactionItemRepository: TransactionItemRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TransactionService,
				{
					provide: getRepositoryToken(ContactInformationEntity),
					useClass: Repository,
				},
				{
					provide: TransactionRepository,
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						remove: jest.fn(),
						findBy: jest.fn(),
						findTransactionById: jest.fn(),
						deleteTransaction: jest.fn(),
						findTransactionList: jest.fn(),
						findTransactionDetailsById: jest.fn(),
						transactionUpdate: jest.fn()
					},
				},
				{
					provide: TransactionItemRepository,
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						findTransactionItem: jest.fn(),
						deleteTransactionItem: jest.fn(),
						sumTransactionItemDetail: jest.fn(),
						findTransactionItemByTransactionId: jest.fn(),
					},
				},
				{
					provide: ProductRepository,
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						findProductById: jest.fn(),
						deleteProduct: jest.fn(),
						findProductList: jest.fn(),
						findProductDetailsById: jest.fn(),
						findAllProduct: jest.fn(),
					},
				},
				{
					provide: CustomersRepository,
					useValue: {
						findCustomerById: jest.fn(),
					},
				},
				{
					provide: UsersRepository,
					useValue: {
						findStaffById: jest.fn(),
					},
				},
				{
					provide: StoreRepository,
					useValue: {
						findStoreById: jest.fn(),
					},
				},
			],
		}).compile();

		transactionService = module.get<TransactionService>(TransactionService);
		transactionRepository = module.get<TransactionRepository>(
			TransactionRepository,
		);
		contactInfoRepository = module.get<Repository<ContactInformationEntity>>(getRepositoryToken(ContactInformationEntity));
		customersRepository = module.get<CustomersRepository>(CustomersRepository);
		userRepository = module.get<UsersRepository>(UsersRepository);
		storeRepository = module.get<StoreRepository>(StoreRepository);
		productRepository = module.get<ProductRepository>(ProductRepository);
		transactionItemRepository = module.get<TransactionItemRepository>(TransactionItemRepository);
	});

	it("should be defined", () => {
		expect(transactionService).toBeDefined();
	});


	describe("addTransaction", () => {
		const user = new UserEntity();
		user.id = 1;
		user.username = "Test user";
		user.password = "123456";

		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		it("should return not found if customer does not exist", async () => {
			const createTransactionDto: Partial<CreateTransactionDto> = {
				customer: 1,
				staff: user.id,
				serviceChargeRate: 200,
				salesTaxRate: 60,
				store: store.id,
				item: [],
			};

			(userRepository.findStaffById as jest.Mock).mockResolvedValue(user);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);
			(customersRepository.findCustomerById as jest.Mock).mockResolvedValue(null);

			await expect(transactionService.addTransaction(createTransactionDto as any)).rejects.toThrow(NotFoundException);
		});

		it("should return not found if staff does not exist", async () => {
			const createTransactionDto: Partial<CreateTransactionDto> = {
				staff: 2,
				serviceChargeRate: 200,
				salesTaxRate: 60,
				store: store.id,
				item: [],
			};

			(userRepository.findStaffById as jest.Mock).mockResolvedValue(null);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);

			await expect(transactionService.addTransaction(createTransactionDto as any)).rejects.toThrow(NotFoundException);
		});

		it("should return not found if store does not exist", async () => {
			const createTransactionDto: Partial<CreateTransactionDto> = {
				staff: user.id,
				serviceChargeRate: 200,
				salesTaxRate: 60,
				store: 2,
				item: [],
			};

			(userRepository.findStaffById as jest.Mock).mockResolvedValue(user);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(null);

			await expect(transactionService.addTransaction(createTransactionDto as any)).rejects.toThrow(NotFoundException);
		});

		it("should return not found if product does not exist", async () => {
			const createTransactionDto: Partial<CreateTransactionDto> = {
				staff: user.id,
				serviceChargeRate: 200,
				salesTaxRate: 60,
				store: store.id,
				item: [{ product: 1, quantity: 2, isRefund: false }],
			};

			(userRepository.findStaffById as jest.Mock).mockResolvedValue(user);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);
			(productRepository.findProductById as jest.Mock).mockResolvedValue(null);

			await expect(transactionService.addTransaction(createTransactionDto as any)).rejects.toThrow(NotFoundException);
		});

		it("should add a new transaction successfully", async () => {
			const contactInfo: ContactInformationEntity = {
				firstName: "John",
				lastName: "Doe",
			} as ContactInformationEntity;
			const customer = new CustomerEntity();
			customer.id = 1;
			customer.contactInfo = contactInfo;
			// customer.firstName = "John";
			// customer.lastName = "Doe";

			const product = { id: 1, price: 100 };

			const createTransactionDto: Partial<CreateTransactionDto> = {
				staff: user.id,
				serviceChargeRate: 200,
				salesTaxRate: 60,
				customer: customer.id,
				store: store.id,
				item: [{ product: product.id, quantity: 2, isRefund: false }],
			};

			const expectedTransaction = { ...createTransactionDto, id: 1 };
			const expectedTransactionItem = {
				transaction: 1,
				product: product.id,
				value: product.price,
				quantity: 2,
				discountValue: 0,
				netPrice: 200,
				isRefund: false,
			};

			(userRepository.findStaffById as jest.Mock).mockResolvedValue(user);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);
			(customersRepository.findCustomerById as jest.Mock).mockResolvedValue(customer);
			(productRepository.findProductById as jest.Mock).mockResolvedValue(product);

			(transactionRepository.create as jest.Mock).mockReturnValue(expectedTransaction);
			(transactionRepository.save as jest.Mock).mockResolvedValue(expectedTransaction);

			(transactionItemRepository.create as jest.Mock).mockReturnValue(expectedTransactionItem);
			(transactionItemRepository.sumTransactionItemDetail as jest.Mock).mockResolvedValue(expectedTransactionItem);
			(transactionItemRepository.save as jest.Mock).mockResolvedValue(expectedTransactionItem);

			const result = await transactionService.addTransaction(createTransactionDto as any);
			expect(result).toEqual(expectedTransaction);
		});
	});

	describe("editTransaction", () => {
		const user = new UserEntity();
		user.id = 1;
		user.username = "Test user";
		user.password = "123456";

		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		const product = {
			id: 1,
			price: 100
		};

		const transactionItem = {
			id: 1,
			product: product.id,
			quantity: 1,
			value: 100,
			discountValue: 0,
			netPrice: 100,
			isRefund: false,
		};

		beforeEach(() => {
			jest.resetAllMocks();
		});

		it("should update transaction item if it exists", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };
			const editTransactionDto = {
				item: [
					{
						transactionItemId: 1,
						product: 1,
						quantity: 2,
					}
				]
			};

			const transaction: any = new TransactionEntity();
			transaction.id = 1;
			transaction.staff = user.id;
			transaction.salesTaxRate = 20;
			transaction.unit = 5;
			transaction.store = store.id;
			transaction.status = TransactionStatus.PENDING;

			(productRepository.findAllProduct as jest.Mock).mockResolvedValue([product]);
			(transactionRepository.findTransactionById as jest.Mock).mockResolvedValue(transaction);
			(transactionItemRepository.findTransactionItem as jest.Mock).mockResolvedValue(transactionItem);
			(transactionRepository.save as jest.Mock).mockResolvedValue({
				...transaction,
				...editTransactionDto,
			});
			(transactionRepository.findTransactionDetailsById as jest.Mock).mockResolvedValue(transaction);

			const result = await transactionService.editTransaction(transactionIdDto, editTransactionDto as any);
			expect(transactionItem.quantity).toBe(2);
			expect(transactionItem.netPrice).toBe(200);
			expect(result).toEqual(
				transaction,
			);
		});

		it("should return not found if transaction does not exist", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };
			const editTransactionDto = { salesTaxRate: 15 };

			(transactionRepository.findTransactionById as jest.Mock).mockResolvedValue(null);

			await expect(transactionService.editTransaction(transactionIdDto, editTransactionDto as any)).rejects.toThrow(NotFoundException);
		});

		it("should return not found if customer does not exist", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };
			const editTransactionDto = { salesTaxRate: 15, customer: 2 };

			const transaction: any = new TransactionEntity();
			transaction.id = 1;
			transaction.staff = user.id;
			transaction.salesTaxRate = 20;
			transaction.unit = 5;
			transaction.store = store.id;

			(transactionRepository.findTransactionById as jest.Mock).mockResolvedValue(transaction);
			(customersRepository.findCustomerById as jest.Mock).mockResolvedValue(null);

			await expect(transactionService.editTransaction(transactionIdDto, editTransactionDto as any)).rejects.toThrow(NotFoundException);
		});

		it("should update transaction data if given customer exists", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };
			const editTransactionDto = { salesTaxRate: 15, customer: 2 };

			const contactInfo: ContactInformationEntity = {
				firstName: "John",
				lastName: "Doe",
			} as ContactInformationEntity;

			const customer = new CustomerEntity();
			customer.id = 1;
			customer.contactInfo = contactInfo;
			// customer.firstName = "John";
			// customer.lastName = "Doe";

			const contactInfo1: ContactInformationEntity = {
				firstName: "David",
				lastName: "Doe",
			} as ContactInformationEntity;

			const customer1 = new CustomerEntity();
			customer1.id = 2;
			customer.contactInfo = contactInfo1;
			// customer1.firstName = "David";
			// customer1.lastName = "Doe";

			const transaction: any = new TransactionEntity();
			transaction.id = 1;
			transaction.staff = user.id;
			transaction.salesTaxRate = 20;
			transaction.unit = 5;
			transaction.customer = 1;
			transaction.store = store.id;

			const expectedTransactionItem = {
				transaction: 1,
				product: product.id,
				value: product.price,
				quantity: 2,
				discountValue: 0,
				netPrice: 200,
				isRefund: false,
			};

			(transactionRepository.findTransactionById as jest.Mock).mockResolvedValue(transaction);
			(customersRepository.findCustomerById as jest.Mock).mockResolvedValue(customer1);
			(transactionRepository.findTransactionDetailsById as jest.Mock).mockResolvedValue(transaction);
			(transactionItemRepository.findTransactionItemByTransactionId as jest.Mock).mockResolvedValue(expectedTransactionItem);

			const result = await transactionService.editTransaction(transactionIdDto, editTransactionDto as any);
			const updatedData = await transactionService.getTransactionDetails(transactionIdDto);
			expect(updatedData.customer).toBe(customer1.id);
			expect(result).toEqual(transaction);
		});

		it("should return not found if staff does not exist", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };
			const editTransactionDto = { salesTaxRate: 15, staff: 2 };

			const transaction: any = new TransactionEntity();
			transaction.id = 1;
			transaction.staff = user.id;
			transaction.salesTaxRate = 20;
			transaction.unit = 5;
			transaction.store = store.id;

			(transactionRepository.findTransactionById as jest.Mock).mockResolvedValue(transaction);
			(userRepository.findStaffById as jest.Mock).mockResolvedValue(null);

			await expect(transactionService.editTransaction(transactionIdDto, editTransactionDto as any)).rejects.toThrow(NotFoundException);
		});

		it("should update transaction data if given staff exists", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };

			const user1 = new UserEntity();
			user1.id = 2;
			user1.username = "Test user new";
			user1.password = "123456";

			const editTransactionDto = { salesTaxRate: 15, staff: user1.id };

			const transaction: any = new TransactionEntity();
			transaction.id = 1;
			transaction.staff = user.id;
			transaction.salesTaxRate = 20;
			transaction.unit = 5;
			transaction.customer = 1;
			transaction.store = store.id;

			(transactionRepository.findTransactionById as jest.Mock).mockResolvedValue(transaction);
			(userRepository.findStaffById as jest.Mock).mockResolvedValue(user1);
			(transactionRepository.findTransactionDetailsById as jest.Mock).mockResolvedValue(transaction);

			const result = await transactionService.editTransaction(transactionIdDto, editTransactionDto as any);
			const updatedData = await transactionService.getTransactionDetails(transactionIdDto);
			expect(updatedData.staff).toBe(user1.id);
			expect(result).toEqual(transaction);
		});
	});

	describe("deleteTransaction", () => {
		const user = new UserEntity();
		user.id = 1;
		user.username = "Test user";
		user.password = "123456";

		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		it("should delete a transaction successfully", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };
			const transaction: any = new TransactionEntity();
			transaction.id = 1;
			transaction.staff = user.id;
			transaction.salesTaxRate = 20;
			transaction.unit = 5;
			transaction.store = store.id;

			(
				transactionRepository.findTransactionById as jest.Mock
			).mockResolvedValue(transaction);
			(transactionRepository.deleteTransaction as jest.Mock).mockResolvedValue(
				null,
			);

			const result = await transactionService.deleteTransaction(transactionIdDto);
			expect(result).toEqual(
				transaction,
			);
		});

		it("should return not found if transaction does not exist", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };

			(
				transactionRepository.findTransactionById as jest.Mock
			).mockResolvedValue(null);

			await expect(transactionService.deleteTransaction(transactionIdDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe('bulkDelete transactions', () => {
		const user = new UserEntity();
		user.id = 1;
		user.username = "Test user";
		user.password = "123456";

		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: "+63", number: "9876543210" };

		it('should bulk delete transactions', async () => {
			const transactions: TransactionEntity[] = [
				plainToInstance(TransactionEntity, {
					id: 1,
					staff: user,
					salesTaxRate: 20,
					store: store
				})
			];

			jest.spyOn(transactionRepository, 'findBy').mockResolvedValue(transactions);
			const removeMock = jest.spyOn(transactionRepository, 'remove').mockResolvedValue(undefined);

			expect(await transactionService.bulkDeleteTransactions([1])).toEqual(transactions);
			transactions.forEach(transaction => {
				expect(removeMock).toHaveBeenCalledWith([transaction]);
			});
			expect(removeMock).toHaveBeenCalledTimes(transactions.length);
		});

		it('should throw an error if no transactions found', async () => {
			jest.spyOn(transactionRepository, 'findBy').mockResolvedValue([]);

			await expect(transactionService.bulkDeleteTransactions([1])).rejects.toThrow(NotFoundException);
		});
	});

	describe("getTransactionList", () => {
		const user = new UserEntity();
		user.id = 1;
		user.username = "Test user";
		user.password = "123456";

		const user1 = new UserEntity();
		user1.id = 1;
		user1.username = "Test user1";
		user1.password = "123456";

		const customer = new CustomerEntity();
		customer.id = 1;
		customer.contactInfo = <ContactInformationEntity>{
			id: 1,
			firstName: "John",
			lastName: "Doe",
		}

		const customer1 = new CustomerEntity();
		customer1.id = 2;
		customer1.contactInfo = <ContactInformationEntity>{
			id: 1,
			firstName: "Jack",
			lastName: "DoPatele",
		}

		const customer2 = new CustomerEntity();
		customer2.id = 3;
		customer2.contactInfo = <ContactInformationEntity>{
			id: 1,
			firstName: "Bob",
			lastName: "Rocky",
		}

		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		const store1 = new Store();
		store1.id = 1;
		store1.Name = 'SuperMart';
		store1.Email = 'info@supermart.com';
		store1.mobile = { countryCode: '+63', number: '9876543211' };

		const transactions: TransactionEntity[] = [
			{
				id: 1,
				staff: user.id,
				salesTaxRate: 10,
				unit: 4,
				customer: customer,
				store: store.id,
				paymentType: PaymentType.CASH,
				status: TransactionStatus.APPROVED
			} as any,
			{
				id: 2,
				staff: user1.id,
				salesTaxRate: 10,
				unit: 4,
				customer: customer1,
				store: store.id,
				paymentType: PaymentType.CASH,
				status: TransactionStatus.PENDING
			},
			{
				id: 3,
				staff: user.id,
				salesTaxRate: 10,
				unit: 4,
				customer: customer2,
				store: store1.id,
				paymentType: PaymentType.DEBIT_CARD,
				status: TransactionStatus.PENDING
			},
			{
				id: 2,
				staff: user1.id,
				salesTaxRate: 10,
				unit: 4,
				customer: customer2,
				store: store1.id,
				paymentType: PaymentType.CREDIT_CARD,
				status: TransactionStatus.FAIL
			},
		];

		it("should return a list of transactions", async () => {
			const listTransactionDto: Partial<ListTransactionDto> = {
				page: 1,
				size: 5,
			};

			const totalRecords = transactions.length;
			(
				transactionRepository.findTransactionList as jest.Mock
			).mockResolvedValue([transactions, totalRecords]);

			const result = await transactionService.getTransactionList(
				listTransactionDto as any,
			);
			expect(result).toEqual(
				{
					transaction: transactions,
					total_record: totalRecords,
				},
			);
		});

		it("apply search", async () => {
			const listTransactionDto: Partial<ListTransactionDto> = {
				search: "J",
				page: 1,
				size: 5,
			};

			const filteredTransactions = transactions.filter(transaction =>
				`${transaction.customer.contactInfo.firstName} ${transaction.customer.contactInfo.lastName}`
					.toLowerCase()
					.includes(listTransactionDto.search.toLowerCase()),
			);
			const totalRecords = filteredTransactions.length;

			(
				transactionRepository.findTransactionList as jest.Mock
			).mockResolvedValue([filteredTransactions, totalRecords]);

			const result = await transactionService.getTransactionList(
				listTransactionDto as any,
			);
			expect(result).toEqual(
				{
					transaction: filteredTransactions,
					total_record: totalRecords,
				},
			);
		});

		it("apply status", async () => {
			const listTransactionDto: Partial<ListTransactionDto> = {
				paymentType: PaymentType.CASH,
				page: 1,
				size: 5,
			};

			const filteredTransactions = transactions.filter(transaction =>
				transaction.status === listTransactionDto.status
			);
			const totalRecords = filteredTransactions.length;

			(
				transactionRepository.findTransactionList as jest.Mock
			).mockResolvedValue([filteredTransactions, totalRecords]);

			const result = await transactionService.getTransactionList(
				listTransactionDto as any,
			);
			expect(result).toEqual(
				{
					transaction: filteredTransactions,
					total_record: totalRecords,
				});
		});

		it("apply payment type", async () => {
			const listTransactionDto: Partial<ListTransactionDto> = {
				paymentType: PaymentType.CASH,
				page: 1,
				size: 5,
			};

			const filteredTransactions = transactions.filter(transaction =>
				transaction.paymentType === listTransactionDto.paymentType
			);
			const totalRecords = filteredTransactions.length;

			(
				transactionRepository.findTransactionList as jest.Mock
			).mockResolvedValue([filteredTransactions, totalRecords]);

			const result = await transactionService.getTransactionList(
				listTransactionDto as any,
			);
			expect(result).toEqual(
				{
					transaction: filteredTransactions,
					total_record: totalRecords,
				},
			);
		});
	});

	describe("getTransactionDetails", () => {
		const user = new UserEntity();
		user.id = 1;
		user.username = "Test user";
		user.password = "123456";

		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		it("should return transaction details", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };
			const product = { id: 1, price: 100 };
			const transaction: any = new TransactionEntity();
			transaction.id = 1;
			transaction.staff = user.id;
			transaction.salesTaxRate = 20;
			transaction.unit = 5;
			transaction.store = store.id;

			const transactionItemArray = []

			const transactionItem1: any = new TransactionItemEntity();
			transactionItem1.id = 1;
			transactionItem1.product = product.id;
			transactionItem1.transaction = transaction.id;
			transactionItem1.value = 100;
			transactionItem1.quantity = 2;
			transactionItem1.isRefund = false;
			transactionItem1.netPrice = 200;
			transactionItem1.discountValue = 0;
			transactionItemArray.push(transactionItem1);

			const transactionItem2: any = new TransactionItemEntity();
			transactionItem2.id = 1;
			transactionItem2.product = product.id;
			transactionItem2.transaction = transaction.id;
			transactionItem2.value = 100;
			transactionItem2.quantity = 2;
			transactionItem2.isRefund = false;
			transactionItem2.netPrice = 200;
			transactionItem2.discountValue = 0;
			transactionItemArray.push(transactionItem2);

			(
				transactionRepository.findTransactionById as jest.Mock
			).mockResolvedValue(transaction);

			(
				transactionRepository.findTransactionDetailsById as jest.Mock
			).mockResolvedValue(transaction);

			(
				transactionItemRepository.findTransactionItemByTransactionId as jest.Mock
			).mockResolvedValue(transactionItemArray);

			const result = await transactionService.getTransactionDetails(transactionIdDto);
			expect(result).toEqual({ ...transaction, transactionItem: transactionItemArray },
			);
		});

		it("should return not found if transaction does not exist", async () => {
			const transactionIdDto: TransactionIdDto = { transactionId: 1 };

			(
				transactionRepository.findTransactionById as jest.Mock
			).mockResolvedValue(null);

			await expect(transactionService.getTransactionDetails(transactionIdDto)).rejects.toThrow(NotFoundException);
		});
	});
});