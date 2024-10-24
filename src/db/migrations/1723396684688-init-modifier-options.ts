import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from "typeorm";

export class InitModifierOptions1723396684688 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "modifier_options_entity",
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
						name: "price",
						type: "float",
						isNullable: false,
					},
					{
						name: "group",
						type: "integer",
						isNullable: false,
					},
					{
						name: "product",
						type: "integer",
						isNullable: false,
					},
				],
			}),
		);
		await queryRunner.createForeignKey(
			"modifier_options_entity",
			new TableForeignKey({
				columnNames: ["group"],
				referencedColumnNames: ["id"],
				referencedTableName: "modifier_groups_entity",
				onDelete: "SET NULL",
			}),
		);
		await queryRunner.createForeignKey(
			"modifier_options_entity",
			new TableForeignKey({
				columnNames: ["product"],
				referencedColumnNames: ["id"],
				referencedTableName: "product_entity",
				onDelete: "SET NULL",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable("modifier_options_entity");
		const groupForeignKey = table.foreignKeys.find(
			fk => fk.columnNames.indexOf("group") !== -1,
		);
		await queryRunner.dropForeignKey(
			"modifier_options_entity",
			groupForeignKey,
		);
		const productForeignKey = table.foreignKeys.find(
			fk => fk.columnNames.indexOf("product") !== -1,
		);
		await queryRunner.dropForeignKey(
			"modifier_options_entity",
			productForeignKey,
		);
		await queryRunner.dropTable("modifier_options_entity");
	}
}
