import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from "typeorm";

export class InitTransaction1720677810114 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "transaction_entity",
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
						name: "store",
						type: "integer",
						isNullable: false,
					},
					{
						name: "customer",
						type: "integer",
						isNullable: true,
					},
					{
						name: "staff",
						type: "integer",
						isNullable: false,
					},
					{
						name: "serviceChargeRate",
						type: "float",
						isNullable: true,
					},
					{
						name: "tip",
						type: "float",
						isNullable: true,
					},
					{
						name: "value",
						type: "float",
						isNullable: true,
					},
					{
						name: "salesTaxRate",
						type: "float",
						isNullable: false,
					},
					{
						name: "paymentType",
						type: "varchar",
						isNullable: false,
						default: `'cash'`,
					},
					{
						name: "status",
						type: "varchar",
						isNullable: false,
						default: `'approved'`,
					},
					{
						name: "type",
						type: "varchar",
						isNullable: false,
						default: `'counter'`,
					},
					{
						name: "transactionDate",
						type: "date",
						isNullable: false,
					},
					{
						name: "note",
						type: "text",
						isNullable: true,
					},
				],
			}),
		);
		await queryRunner.createForeignKey(
			"transaction_entity",
			new TableForeignKey({
				columnNames: ["customer"],
				referencedColumnNames: ["id"],
				referencedTableName: "customer_entity",
				onDelete: "SET NULL",
			}),
		);
		await queryRunner.createForeignKey(
			"transaction_entity",
			new TableForeignKey({
				columnNames: ["staff"],
				referencedColumnNames: ["id"],
				referencedTableName: "user_entity",
				onDelete: "SET NULL",
			}),
		);
		await queryRunner.createForeignKey(
			"transaction_entity",
			new TableForeignKey({
				columnNames: ["store"],
				referencedColumnNames: ["id"],
				referencedTableName: "store",
				onDelete: "SET NULL",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable("transaction_entity");
		const customerForeignKey = table.foreignKeys.find(
			fk => fk.columnNames.indexOf("customer") !== -1,
		);
		await queryRunner.dropForeignKey("transaction_entity", customerForeignKey);
		const staffForeignKey = table.foreignKeys.find(
			fk => fk.columnNames.indexOf("staff") !== -1,
		);
		const storeForeignKey = table.foreignKeys.find(
			fk => fk.columnNames.indexOf("store") !== -1,
		);
		await queryRunner.dropForeignKey("transaction_entity", storeForeignKey);
		await queryRunner.dropForeignKey("transaction_entity", staffForeignKey);
		await queryRunner.dropTable("transaction_entity");
	}
}
