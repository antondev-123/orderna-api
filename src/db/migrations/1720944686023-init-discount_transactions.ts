import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitDiscountTransactions1720944686020 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "discount_transactions",
                columns: [
                    {
                        name: 'discountTransactionId',
                        type: 'integer',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: "transactionId",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "customerId",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "customerName",
                        type: "integer",
                        isNullable: false,
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
                        name: "amount",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "discountValue",
                        type: "decimal",
                        isNullable: false,
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
                        columnNames: ["discountTransactionId"],
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
        // await queryRunner.createForeignKey(
        //     "transaction_entity",
        //     new TableForeignKey({
        //         columnNames: ["transactionId"],
        //         referencedColumnNames: ["id"],
        //         referencedTableName: "transaction_entity",
        //         onDelete: "SET NULL",
        //     }),
        // );
        // await queryRunner.createForeignKey(
        //     "customer_entity",
        //     new TableForeignKey({
        //         columnNames: ["customerId"],
        //         referencedColumnNames: ["id"],
        //         referencedTableName: "customer_entity",
        //         onDelete: "SET NULL",
        //     }),
        // );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("discount_transactions");
    }

}
