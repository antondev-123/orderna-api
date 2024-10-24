import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitDiscountStores1720944686022 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "discount_stores",
                columns: [
                    {
                        name: 'discountStoreId',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: "discountId",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "storeId",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "storeName",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "discountStatus",
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
                    {
                        name: "deletedAt",
                        type: "timestamptz",
                        isNullable: true,
                        default: null
                    },
                ],
                uniques: [
                    {
                        columnNames: ["discountStoreId"],
                    },
                ],
            }),
        );
        // await queryRunner.createForeignKey(
        //     "discounts",
        //     new TableForeignKey({
        //         columnNames: ["discountId"],
        //         referencedColumnNames: ["discountId"],
        //         referencedTableName: "discounts",
        //         onDelete: "SET NULL",
        //     }),
        // );
        // await queryRunner.createForeignKey(
        //     "stores",
        //     new TableForeignKey({
        //         columnNames: ["storeId"],
        //         referencedColumnNames: ["id"],
        //         referencedTableName: "stores",
        //         onDelete: "SET NULL",
        //     }),
        // );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "discount_stores"`);
    }

}
