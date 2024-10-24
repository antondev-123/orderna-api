import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from "typeorm";

export class InitOpeningHours1720944657340 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "opening_hours",
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
						name: "store_id",
						type: "integer",
						isNullable: false,
					},
					{
						name: "openingDayOfWeek",
						type: "varchar",
						isNullable: false,
					},
					{
						name: "openingTimeSlots",
						type: "text",
					},
					{
						name: "openingIsClosed",
						type: "boolean",
						isNullable: false,
						default: "false",
					},
					{
						name: "openingIs24Hours",
						type: "boolean",
						isNullable: false,
						default: "false",
					},
				],
			}),
		);
		await queryRunner.createForeignKey(
			"opening_hours",
			new TableForeignKey({
				columnNames: ["store_id"],
				referencedColumnNames: ["id"],
				referencedTableName: "store",
				onDelete: "SET NULL",
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable("opening_hours");
		const storeForeignKey = table.foreignKeys.find(
			fk => fk.columnNames.indexOf("store_id") !== -1,
		);
		await queryRunner.dropForeignKey("opening_hours", storeForeignKey);
		await queryRunner.dropTable("opening_hours");
	}
}
