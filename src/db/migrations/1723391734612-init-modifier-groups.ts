import {
	MigrationInterface,
	QueryRunner,
	Table,
} from "typeorm";

export class InitModifierGroups1723391734612 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "modifier_groups_entity",
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
						name: "sku_plu",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "limit",
						type: "integer",
						isNullable: false,
					},
					{
						name: "description",
						type: "varchar",
						isNullable: true,
					},
				],
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("modifier_groups_entity");
	}
}
