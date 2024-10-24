import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isEmpty } from "class-validator";
import { customerResponseMessage, errorResponseMessage, storeResponseMessage } from "src/common/constants/response-messages";
import { pagination } from "src/common/dtos/pagination-default";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { StoreRepository } from "src/store/repository/store.repository";
import { Repository } from "typeorm";
import { CustomersRepository } from "./customer.repository";
import { CreateCustomerDto } from "./dtos/create-customer.dto";
import { DeleteCustomerDto } from "./dtos/delete-customer.dto";
import { EditCustomerDto } from "./dtos/edit-customer.dto";
import { FilterCustomerDto } from "./dtos/filter-customer.dto";
import { CustomerIdDto } from "./dtos/params-customer.dto";

@Injectable()
export class CustomersService {
	constructor(
		@InjectRepository(ContactInformationEntity)
		private contactInfoRepository: Repository<ContactInformationEntity>,
		@InjectRepository(CustomersRepository)
		private customersRepository: CustomersRepository,
		@InjectRepository(StoreRepository)
		private readonly storeRepository: StoreRepository,
	) { }

	async addCustomer(createCustomerDto: CreateCustomerDto) {
		try {
			const store = await this.storeRepository.findStoreById(createCustomerDto.store)
			if (!store) {
				throw new NotFoundException(
					storeResponseMessage.STORE_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}

			const contactInfo = this.contactInfoRepository.create({
				company: createCustomerDto.company,
				firstName: createCustomerDto.firstName,
				lastName: createCustomerDto.lastName,
				birthday: createCustomerDto.birthday,
				...(createCustomerDto.mobile ? {
					mobileCountryCode: createCustomerDto.mobile.countryCode,
					mobileNumber: createCustomerDto.mobile.number,
				} : {}),
				...(createCustomerDto.telephone ? {
					telephoneCountryCode: createCustomerDto.telephone.countryCode,
					telephoneNumber: createCustomerDto.telephone.number,
				} : {}),
				email: createCustomerDto.email,
				city: createCustomerDto.city,
				street: createCustomerDto.street,
				zipCode: createCustomerDto.zipCode
			});

			const customer = this.customersRepository.create({
				note: createCustomerDto.note,
				store: { id: store.id },
				contactInfo: contactInfo
			});

			return await this.customersRepository.save(customer);
		} catch (error) {
			throw error;
		}
	}

	async editCustomer(
		customerIdDto: CustomerIdDto,
		editCustomerDto: EditCustomerDto,
	) {
		try {
			const customer = await this.customersRepository.findCustomerById(
				customerIdDto.customerId,
			);
			if (!customer) {
				throw new NotFoundException(
					customerResponseMessage.CUSTOMER_NOT_FOUND,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}
			if (editCustomerDto.store) {
				const store: any = await this.storeRepository.findStoreById(editCustomerDto.store)
				if (!store) {
					throw new NotFoundException(
						storeResponseMessage.STORE_NOT_FOUND,
						errorResponseMessage.NOT_FOUND.EN,
					);
				}
				customer.store = store.id
			}

			isEmpty(editCustomerDto.note) ? customer.note : customer.note = editCustomerDto.note;
			const contactInfo = this.contactInfoRepository.create({
				company: editCustomerDto.company,
				firstName: editCustomerDto.firstName,
				lastName: editCustomerDto.lastName,
				birthday: editCustomerDto.birthday,
				...(editCustomerDto.mobile ? {
					mobileCountryCode: editCustomerDto.mobile.countryCode,
					mobileNumber: editCustomerDto.mobile.number,
				} : {}),
				...(editCustomerDto.telephone ? {
					telephoneCountryCode: editCustomerDto.telephone.countryCode,
					telephoneNumber: editCustomerDto.telephone.number,
				} : {}),
				email: editCustomerDto.email,
				city: editCustomerDto.city,
				street: editCustomerDto.street,
				zipCode: editCustomerDto.zipCode
			});

			Object.assign(customer.contactInfo, contactInfo);

			return await this.customersRepository.save(customer);
		} catch (error) {
			throw error;
		}
	}

	async deleteCustomer(customerId: number) {
		try {
			const customer = await this.customersRepository.findCustomerById(customerId);
			if (!customer) {
				throw new NotFoundException(
					customerResponseMessage.CUSTOMER_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}
			await this.customersRepository.deleteCustomer(customerId);
		} catch (error) {
			throw error;
		}
	}

	async deleteCustomers(deleteCustomerDto: DeleteCustomerDto) {
		try {
			const customer = await this.customersRepository.findCustomerByIds(
				deleteCustomerDto.customerIds,
			);
			if (!(customer && customer.length)) {
				return {};
			}
			await this.customersRepository.deleteCustomers(deleteCustomerDto.customerIds);
			return customer;
		} catch (error) {
			throw error;
		}
	}

	async getCustomerDetails(customerIdDto: CustomerIdDto) {
		try {
			const customer = await this.customersRepository.findCustomerById(
				customerIdDto.customerId,
			);
			if (!customer) {
				throw new NotFoundException(
					customerResponseMessage.CUSTOMER_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}
			return customer;
		} catch (error) {
			throw error;
		}
	}

	async getCustomerList(
		filterDto: FilterCustomerDto,
	) {
		try {
			const skip =
				((filterDto.page ?? pagination.defaultPage) - 1) *
				(filterDto.size ?? pagination.pageSize);
			const take = filterDto.size ?? pagination.pageSize;

			const [customer, total_record] =
				await this.customersRepository.findCustomerList(
					filterDto.store,
					filterDto.field,
					filterDto.sort,
					filterDto.fromDate,
					filterDto.toDate,
					filterDto.search,
					skip,
					take,
				);
			if (!(customer && customer.length)) {
				return { customer: [], total_record: 0 };
			}
			return { customer: customer, total_record: total_record }
		} catch (error) {
			throw error;
		}
	}
}
