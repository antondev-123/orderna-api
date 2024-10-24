import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class InitSupplier1721696160894 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "supplier",
                columns: [
                    {
                        name: "supplierID",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "supplierFirstName",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "supplierLastName",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "supplierCompany",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "supplierZipCode",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "supplierCity",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "supplierStreet",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "supplierMobilePhone",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "supplierTelephone",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "supplierEmail",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "supplierNote",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: "deletedAt",
                        type: "timestamp",
                        isNullable: true,
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("supplier");
    }
}
