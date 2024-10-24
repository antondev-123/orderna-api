import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitDiscounts1720944686021 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "discounts",
                columns: [
                    {
                        name: 'discountId',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: "discountCode",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "discountName",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "discountType",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "discountValue",
                        type: "decimal",
                        isNullable: false,
                    },
                    {
                        name: "minimumSpend",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "limitOverall",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "limitCustomer",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "discountStatus",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "startDate",
                        type: "timestamptz",
                        isNullable: false,
                    },
                    {
                        name: "endDate",
                        type: "timestamptz",
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
                    {
                        name: "deletedAt",
                        type: "timestamptz",
                        isNullable: true,
                        default: null
                    },
                ],
                uniques: [
                    {
                        columnNames: ["discountId"],
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "discounts"`);
    }

}
