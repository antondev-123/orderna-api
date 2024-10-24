import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from "typeorm";

export class InitModifierGroupsCategory1723440431894
	implements MigrationInterface
{
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "modifier_groups_category_entity",
				columns: [
					{
						name: "modifier_group_id",
						type: "integer",
						isPrimary: true,
					},
					{
						name: "category_id",
						type: "integer",
						isPrimary: true,
					},
				],
			}),
		);

		await queryRunner.createForeignKey(
			"modifier_groups_category_entity",
			new TableForeignKey({
				columnNames: ["modifier_group_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "modifier_groups_entity",
				onDelete: "CASCADE",
			}),
		);

		await queryRunner.createForeignKey(
			"modifier_groups_category_entity",
			new TableForeignKey({
				columnNames: ["category_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "category_entity",
				onDelete: "CASCADE",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("modifier_groups_category_entity");
	}
}
