import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from "typeorm";

export class InitCustomer1720415815890 implements MigrationInterface {
	name = "InitCustomer1720415815890";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "customer_entity",
				columns: [
					{
						name: "createdAt",
						type: "timestamptz",
						isNullable: false,
						default: `CURRENT_TIMESTAMP`,
					},
					{
						name: "updatedAt",
						type: "timestamptz",
						isNullable: false,
						default: `CURRENT_TIMESTAMP`,
					},
					{
						name: "deletedAt",
						type: "timestamptz",
						isNullable: true,
					},
					{
						name: "id",
						type: "integer",
						isPrimary: true,
						isGenerated: true,
						generationStrategy: "increment",
					},
					{
						name: "firstName",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "lastName",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "company",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "zipCode",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "city",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "street",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "mobilePhone",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "telephone",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "email",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "birthday",
						type: "date",
						isNullable: true,
					},
					{
						name: "note",
						type: "text",
						isNullable: true,
					},
					{
						name: "store",
						type: "integer",
						isNullable: false,
					},
				],
			}),
		);
		await queryRunner.createForeignKey(
			"customer_entity",
			new TableForeignKey({
				columnNames: ["store"],
				referencedColumnNames: ["id"],
				referencedTableName: "store",
				onDelete: "SET NULL",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable("customer_entity");
		const storeForeignKey = table.foreignKeys.find(
			fk => fk.columnNames.indexOf("store") !== -1,
		);
		await queryRunner.dropForeignKey("customer_entity", storeForeignKey);
		await queryRunner.dropTable("customer_entity");
	}
}
