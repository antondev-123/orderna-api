import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitTransactionItem1721642664204 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "transaction_item_entity",
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
                        name: "product",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "transaction",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "value",
                        type: "float",
                        isNullable: false,
                    },
                    {
                        name: "quantity",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "isRefund",
                        type: "boolean",
                        isNullable: false,
                        default: "false",
                    },
                    {
                        name: "netPrice",
                        type: "float",
                        isNullable: false,
                    },
                    {
                        name: "discountValue",
                        type: "float",
                        isNullable: false,
                    },
                ],
            }),
        );
        await queryRunner.createForeignKey(
            "transaction_item_entity",
            new TableForeignKey({
                columnNames: ["product"],
                referencedColumnNames: ["id"],
                referencedTableName: "product_entity",
                onDelete: "SET NULL",
            }),
        );
        await queryRunner.createForeignKey(
            "transaction_item_entity",
            new TableForeignKey({
                columnNames: ["transaction"],
                referencedColumnNames: ["id"],
                referencedTableName: "transaction_entity",
                onDelete: "SET NULL",
            }),
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("transaction_item_entity");
        const productForeignKey = table.foreignKeys.find(
            fk => fk.columnNames.indexOf("product") !== -1,
        );
        await queryRunner.dropForeignKey("transaction_item_entity", productForeignKey);
        const transactionForeignKey = table.foreignKeys.find(
            fk => fk.columnNames.indexOf("transaction_entity") !== -1,
        );
        await queryRunner.dropForeignKey("transaction_item_entity", transactionForeignKey);
        await queryRunner.dropTable("transaction_item_entity");
    }

}
