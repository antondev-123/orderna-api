import { Injectable } from "@nestjs/common";
import { Brackets, DataSource, In, Repository } from "typeorm";
import { CustomerEntity } from "./customer.entity";

@Injectable()
export class CustomersRepository extends Repository<CustomerEntity> {
	constructor(
		private readonly dataSource: DataSource,
	) {
		super(CustomerEntity, dataSource.createEntityManager());
	}

	async findCustomerById(customerId) {
		try {
			return await this.findOne({
				where: {
					id: customerId,
					deletedAt: null,
				},
				relations: { contactInfo: true }
			});
		} catch (error) {
			throw error;
		}
	}

	async findCustomerByIds(customerId) {
		try {
			return await this.find({
				where: {
					id: In(customerId),
					deletedAt: null,
				},
				relations: { contactInfo: true }
			});
		} catch (error) {
			throw error;
		}
	}

	async deleteCustomer(customerId) {
		try {
			return await this.update(
				{
					id: customerId,
				},
				{
					deletedAt: new Date(),
				},
			);
		} catch (error) {
			throw error;
		}
	}

	async deleteCustomers(customerId) {
		try {
			return await this.update(
				{
					id: In(customerId),
				},
				{
					deletedAt: new Date(),
				},
			);
		} catch (error) {
			throw error;
		}
	}

	async findCustomerList(
		store,
		field,
		sort,
		fromDate,
		toDate,
		search,
		skip,
		take,
	) {
		try {
			const currentDate = new Date()
				.toISOString()
				.slice(0, 19)
				.replace("T", " ");
			const query = this.createQueryBuilder("customer")
				.where("customer.createdAt BETWEEN :fromDate AND :toDate", {
					fromDate,
					toDate: toDate || currentDate,
				})
				.leftJoin("customer.store", "store")
				.leftJoin("contact_information_entity", "c", "c.customerId = customer.id")
				.leftJoin("transaction_entity", "t", "t.customer = customer.id")
				.addSelect("COUNT(t.id)", "transactionCount")
				.groupBy("customer.id")
				.addGroupBy("c.id ")
				.addGroupBy("store.id")
				.select([
					"customer.id AS id",
					"c.id AS contactInformationId",
					"store.id AS storeId",
					"c.firstName AS firstName",
					"c.lastName AS lastName",
					"customer.createdAt AS createdAt",
					"customer.updatedAt AS updatedAt",
					"customer.deletedAt AS deletedAt",
					"c.company AS company",
					"c.zipCode AS zipCode",
					"c.city AS city",
					"c.street AS street",
					"c.mobileCountrycode AS mobileCountryCode",
					"c.mobileNumber AS mobileNumber",
					"c.telephoneCountrycode AS telephoneCountryCode",
					"c.telephoneNumber AS telephoneNumber",
					"c.email AS email",
					"c.birthday AS birthday",
					"customer.note AS note",
					// TODO: Update entity. Customer shouldn't be limited to 1 store.
					"store.id AS storeId",
					"store.Name AS storeName",
					"COUNT(t.id) AS transactionCount",
				]);
			if (store) {
				query.andWhere("store.Name = :store", { store: store });
			}
			if (field === "createdAt") {
				query.orderBy(
					"customer.createdAt",
					sort === "desc" ? "DESC" : "ASC",
				);
			} else if (field === "email") {
				query.orderBy("contactInfo.email", sort === "desc" ? "DESC" : "ASC");
			} else if (field === "mobile") {
				query.orderBy("contactInfo.mobilePhone", sort === "desc" ? "DESC" : "ASC");
			} else if (field === "fullName") {
				query.orderBy(
					"contactInfo.firstName || ' ' || contactInfo.lastName",
					sort === "desc" ? "DESC" : "ASC",
				);
			}
			let count;
			if (search) {
				const searchLower = search.toLowerCase();
				query.andWhere(
					new Brackets(qb => {
						qb.where("LOWER(c.firstName) LIKE :search", {
							search: `%${searchLower}%`,
						})
							.orWhere("LOWER(c.lastName) LIKE :search", {
								search: `%${searchLower}%`,
							})
							.orWhere(
								"LOWER(c.firstName || ' ' || c.lastName) LIKE :search",
								{ search: `%${searchLower}%` },
							);
					}),
				);
				count = await query.getCount();
			} else {
				count = await query.getCount();
			}
			const customers = await query.take(take).skip(skip).getRawMany();

			const customerData = customers.map(customer => ({
				...customer,
				transactionCount: parseInt(customer.transactionCount, 10) || 0,
			}));
			return [customerData, count];
		} catch (error) {
			throw error;
		}
	}
}
