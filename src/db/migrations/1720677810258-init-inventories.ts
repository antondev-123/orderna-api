import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from "typeorm";

export class InitInventories1720677810258 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "inventory",
				columns: [
					{
						name: "inventoryItemID",
						type: "integer",
						isPrimary: true,
						isGenerated: true,
						generationStrategy: "increment",
					},
					{
						name: "storeID",
						type: "integer",
						isNullable: false,
						foreignKeyConstraintName: "storeID",
					},
					{
						name: "title",
						type: "varchar",
						isNullable: false,
						length: "180",
					},
					{
						name: "unit",
						type: "varchar",
						isNullable: false,
					},
					{
						name: "sk_plu",
						type: "varchar",
						isNullable: false,
					},
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
				],
			}),
			true, // ifExists
		);
		await queryRunner.createForeignKey(
			"inventory",
			new TableForeignKey({
				columnNames: ["storeID"],
				referencedColumnNames: ["id"],
				referencedTableName: "store",
				onDelete: "SET NULL",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Drop user_entity and general_info_entity tables
		await queryRunner.query(`DROP TABLE "inventory";`);
	}
}
