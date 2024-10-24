import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Refund1723559073795 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "refund_transactions",
				columns: [
					{
						name: "createdAt",
						type: "datetime",
						isNullable: false,
						default: `CURRENT_TIMESTAMP`,
					},
					{
						name: "updatedAt",
						type: "datetime",
						isNullable: false,
						default: `CURRENT_TIMESTAMP`,
					},
					{
						name: "deletedAt",
						type: "datetime",
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
						name: "refund_number",
						type: "varchar",
						isNullable: false,
					},
					{
						name: "refund_amount",
						type: "float",
						isNullable: false,
					},
					{
						name: "refund_reason",
						type: "varchar",
						isNullable: false,
					},
				],
			}),
		);
		await queryRunner.createForeignKey(
			"refund_transactions",
			new TableForeignKey({
				columnNames: ["transaction_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "transaction_entity",
				onDelete: "SET NULL",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable("refund_transaction_entity");
		const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("transaction_id") !== -1);
		await queryRunner.dropForeignKey("refund_transaction_entity", foreignKey);
		await queryRunner.dropTable("refund_transaction_entity");
	}
}
