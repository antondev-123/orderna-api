import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { Store } from "src/store/entities/store.entity";
import { StoreRepository } from "src/store/repository/store.repository";
import { Repository } from "typeorm";
import { CustomerEntity } from "./customer.entity";
import { CustomersRepository } from "./customer.repository";
import { CustomersService } from "./customer.service";
import { CreateCustomerDto } from "./dtos/create-customer.dto";
import { DeleteCustomerDto } from "./dtos/delete-customer.dto";
import { FilterCustomerDto } from "./dtos/filter-customer.dto";
import { CustomerIdDto } from "./dtos/params-customer.dto";

describe("CustomersService", () => {
	let service: CustomersService;
	let repository: CustomersRepository;
	let contactInfoRepository: Repository<ContactInformationEntity>;
	let storeRepository: StoreRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CustomersService,
				{
					provide: getRepositoryToken(ContactInformationEntity),
					useValue: {
						create: jest.fn()
					},
				},
				{
					provide: getRepositoryToken(CustomersRepository),
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						findCustomerById: jest.fn(),
						deleteCustomer: jest.fn(),
						findCustomerList: jest.fn(),
						findCustomerByIds: jest.fn(),
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

		service = module.get<CustomersService>(CustomersService);
		contactInfoRepository = module.get<Repository<ContactInformationEntity>>(getRepositoryToken(ContactInformationEntity));
		storeRepository = module.get<StoreRepository>(StoreRepository);
		repository = module.get<CustomersRepository>(
			getRepositoryToken(CustomersRepository),
		);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("addCustomer", () => {
		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		it("should add a new customer successfully", async () => {
			const createCustomerDto: CreateCustomerDto = {
				store: store.id,
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				company: "Example Corp",
				zipCode: 12345,
				city: "Example City",
				street: "123 Example St",
				mobile: { countryCode: '+63', number: '9876543210' },
				telephone: { countryCode: '+63', number: '123456789' },
				birthday: new Date(),
				note: "Test note",
			};
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);
			(repository.create as jest.Mock).mockReturnValue(null);
			(repository.save as jest.Mock).mockResolvedValue(createCustomerDto);

			const result = await service.addCustomer(createCustomerDto);
			expect(result).toEqual(createCustomerDto);
		});

		it("should return not found if store does not exist", async () => {
			// pass store id without creating it
			const createCustomerDto: CreateCustomerDto = {
				store: 2,
				firstName: "John",
				lastName: "Doe",
				mobile: { countryCode: '+63', number: '9876543210' },
				telephone: { countryCode: '+63', number: '123456789' },
				email: "john.doe@example.com",
				company: "Example Corp",
				zipCode: 12345,
				city: "Example City",
				street: "123 Example St",
				birthday: new Date(),
				note: "Test note",
			};

			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(null);

			await expect(service.addCustomer(createCustomerDto as any)).rejects.toThrow(NotFoundException);
		});
	});

	describe("editCustomer", () => {
		it("should edit an existing customer successfully", async () => {
			const customerIdDto: CustomerIdDto = { customerId: 1 };
			const editCustomerDto: any = { firstName: "Bob" };

			const customer = new CustomerEntity();
			customer.id = 1;
			customer.contactInfo = <ContactInformationEntity>{
				firstName: "John",
				lastName: "Doe",
			};

			(repository.findCustomerById as jest.Mock).mockResolvedValue(customer);
			customer.contactInfo = {
				...customer.contactInfo,
				...editCustomerDto
			};
			(repository.save as jest.Mock).mockResolvedValue(customer);

			const result = await service.editCustomer(customerIdDto, editCustomerDto);
			const updatedCustomerData = await service.getCustomerDetails({
				customerId: 1,
			});
			expect(updatedCustomerData.contactInfo.firstName).toBe(
				editCustomerDto.firstName,
			);
			expect(result.contactInfo.firstName).toBe(editCustomerDto.firstName)
		});

		it("should return not found if customer does not exist", async () => {
			const customerIdDto: CustomerIdDto = { customerId: 1 };
			const editCustomerDto: any = { firstName: "Jane" };

			(repository.findCustomerById as jest.Mock).mockResolvedValue(null);

			await expect(service.editCustomer(customerIdDto, editCustomerDto))
				.rejects.toThrow(NotFoundException);
		});
	});

	describe('deleteCustomer', () => {
		it('should remove a customer', async () => {
			const customer = {
				id: 1,
				contactInfo: {
					firstName: 'John',
					lastName: 'Doe'
				},
			} as CustomerEntity;

			const findCustomerByIdSpy = jest.spyOn(repository, 'findCustomerById').mockResolvedValue(customer);
			const deleteCustomerSpy = jest.spyOn(repository, 'deleteCustomer').mockResolvedValue({ raw: '', affected: 1, generatedMaps: [] });

			await expect(service.deleteCustomer(customer.id)).resolves.not.toThrow();
			expect(findCustomerByIdSpy).toHaveBeenCalledWith(customer.id);
			expect(deleteCustomerSpy).toHaveBeenCalledWith(customer.id);
		});

		it('should throw an error if supplier not found', async () => {
			const findCustomerByIdSpy = jest.spyOn(repository, 'findCustomerById').mockResolvedValue(null);

			await expect(service.deleteCustomer(1)).rejects.toThrow(NotFoundException);

			expect(findCustomerByIdSpy).toHaveBeenCalledWith(1);
		});
	});

	describe("deleteCustomers", () => {
		it("should delete multiple customers successfully", async () => {
			const deleteCustomerDto: DeleteCustomerDto = { customerIds: [1, 2] };
			const customer1 = new CustomerEntity();
			customer1.id = 1;
			customer1.contactInfo = <ContactInformationEntity>{
				firstName: "John",
				lastName: "Doe",
			}
			customer1.deletedAt = null;

			const customer2 = new CustomerEntity();
			customer2.id = 2;
			customer2.contactInfo = <ContactInformationEntity>{
				firstName: "David",
				lastName: "Smith",
			}
			customer2.deletedAt = null;

			(repository.create as jest.Mock).mockReturnValue(customer1);
			(repository.save as jest.Mock).mockResolvedValue(customer1);
			(repository.create as jest.Mock).mockReturnValue(customer2);
			(repository.save as jest.Mock).mockResolvedValue(customer2);

			const result = await service.deleteCustomers(deleteCustomerDto);
			expect(result).toEqual({});
		});
	});

	describe("getCustomerDetails", () => {
		const customerIdDto: CustomerIdDto = { customerId: 1 };
		const contactInfo: ContactInformationEntity = {
			firstName: "John",
			lastName: "Doe",
		} as ContactInformationEntity;

		const customer = new CustomerEntity();
		customer.id = 1;
		customer.contactInfo = contactInfo;
		// customer.contactInfo.firstName = "John";
		// customer.contactInfo.lastName = "Doe";

		it("should return customer details", async () => {
			(repository.findCustomerById as jest.Mock).mockResolvedValue(customer);
			const result = await service.getCustomerDetails(customerIdDto);
			expect(result).toEqual(customer);
		});

		it("should return not found if customer does not exist", async () => {
			const nonExistentCustomerIdDto: CustomerIdDto = { customerId: 2 };
			(repository.findCustomerById as jest.Mock).mockResolvedValue(null);

			await expect(service.getCustomerDetails(nonExistentCustomerIdDto))
				.rejects.toThrow(NotFoundException);
		});
	});

	describe("getCustomerList", () => {
		const customers: CustomerEntity[] = [
			{ id: 1, contactInfo: { firstName: "John", lastName: "Doe" } } as CustomerEntity,
			{ id: 2, contactInfo: { firstName: "Jack", lastName: "Smith" } } as CustomerEntity,
			{ id: 3, contactInfo: { firstName: "Alice", lastName: "Brown" } } as CustomerEntity,
		];

		it("should return a list of customers", async () => {
			const filterDto: FilterCustomerDto = {
				fromDate: new Date("2024-05-08"),
				toDate: null,
				search: "",
				page: 1,
				size: 5,
				field: "firstName",
				sort: "ASC",
			}

			const totalRecords = customers.length;
			(repository.findCustomerList as jest.Mock).mockResolvedValue([
				customers,
				totalRecords,
			]);
			const result = await service.getCustomerList(filterDto);
			expect(result).toEqual(
				{
					customer: customers,
					total_record: totalRecords,
				});
		});

		it("apply search", async () => {
			const filterDto: FilterCustomerDto = {
				fromDate: new Date("2024-05-08"),
				toDate: null,
				search: "",
				page: 1,
				size: 5,
				field: "firstName",
				sort: "ASC",
			}

			const filteredCustomers = customers.filter(
				customer =>
					customer.contactInfo.firstName
						.toLowerCase()
						.includes(filterDto.search.toLowerCase()) ||
					customer.contactInfo.lastName
						.toLowerCase()
						.includes(filterDto.search.toLowerCase()),
			);
			const totalRecords = filteredCustomers.length;
			(repository.findCustomerList as jest.Mock).mockResolvedValue([
				filteredCustomers,
				totalRecords,
			]);
			const result = await service.getCustomerList(filterDto);
			expect(result).toEqual(
				{
					customer: filteredCustomers,
					total_record: filteredCustomers.length,
				},
			);
		});
	});
});