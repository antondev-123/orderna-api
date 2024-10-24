import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from "typeorm";

export class InitProduct1720594140900 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "product_entity",
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
						name: "title",
						type: "varchar",
						isNullable: false,
					},
					{
						name: "cost",
						type: "float",
						isNullable: false,
					},
					{
						name: "price",
						type: "float",
						isNullable: false,
					},
					{
						name: "unit",
						type: "float",
						isNullable: false,
					},
					{
						name: "stock",
						type: "float",
						isNullable: true,
					},
					{
						name: "sk_plu",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "description",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "url",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "category",
						type: "integer",
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
			"product_entity",
			new TableForeignKey({
				columnNames: ["category"],
				referencedColumnNames: ["id"],
				referencedTableName: "category_entity",
				onDelete: "SET NULL",
			}),
		);

		await queryRunner.createForeignKey(
			"product_entity",
			new TableForeignKey({
				columnNames: ["store"],
				referencedColumnNames: ["id"],
				referencedTableName: "store",
				onDelete: "SET NULL",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable("product_entity");
		const categoryForeignKey = table.foreignKeys.find(
			fk => fk.columnNames.indexOf("category") !== -1,
		);
		await queryRunner.dropForeignKey("product_entity", categoryForeignKey);
		const storeForeignKey = table.foreignKeys.find(
			fk => fk.columnNames.indexOf("store") !== -1,
		);
		await queryRunner.dropForeignKey("product_entity", storeForeignKey);
		await queryRunner.dropTable("product_entity");
	}
}
