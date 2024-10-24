import {
	MigrationInterface,
	QueryRunner,
	Table
} from "typeorm";

export class InitStores1720944686020 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "store",
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
						name: "name",
						type: "varchar",
						isNullable: false,
					},
					{
						name: "location",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "currency",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "about",
						type: "text",
						isNullable: true,
					},
					{
						name: "email",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "mobileNumber",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "website",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "streetAddress",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "buildingNameNumber",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "city",
						type: "varchar",
						isNullable: true,
					},
					{
						name: "zipCode",
						type: "intvarchareger",
						isNullable: true,
					},
					{
						name: "vatNumber",
						type: "integer",
						isNullable: true,
					},
					{
						name: "isOpen",
						type: "boolean",
						isNullable: false,
						default: "false",
					},
				],
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable("store");
		await queryRunner.dropTable("store");
	}
}
