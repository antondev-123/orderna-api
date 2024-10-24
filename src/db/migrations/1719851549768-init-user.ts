import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitUser1719851549768 implements MigrationInterface {
    name = "InitUser1719851549768";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create user_entity table
        await queryRunner.createTable(
            new Table({
                name: "user_entity",
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
                        name: "wageId",
                        type: "integer",
                        isNullable: true,
                    },
                    {
                        name: "username",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "password",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "role",
                        type: "varchar",
                        isNullable: false,
                        default: `'admin'`,
                    },
                    {
                        name: "status",
                        type: "varchar",
                        isNullable: false,
                        default: `'active'`,
                    },
                    {
                        name: "pin",
                        type: "integer",
                        isNullable: true,
                    }
                ],
            }),
            true // ifExists
        );

        // Create general_info_entity table
        await queryRunner.createTable(
            new Table({
                name: "contact_information_entity",
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
                        name: "userId",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "firstName",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "lastName",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "birthday",
                        type: "timestamptz",
                        isNullable: true,
                    },
                    {
                        name: "mobileCountrycode",
                        type: "varchar",
                        length: "3",
                        isNullable: true,
                    },
                    {
                        name: "mobileNumber",
                        type: "varchar",
                        length: "10",
                        isNullable: true,
                    },
                    {
                        name: "telephoneCountrycode",
                        type: "varchar",
                        length: "3",
                        isNullable: true,
                    },
                    {
                        name: "telephoneNumber",
                        type: "varchar",
                        length: "9",
                        isNullable: true,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "street",
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
                        type: "integer",
                        isNullable: true,
                    },
                ],
                uniques: [
                    {
                        name: "UQ_96d51d247bacd74f025eef063e4",
                        columnNames: ["mobileNumber"],
                    },
                    {
                        name: "UQ_2261f43c40c249551ea8c60bb2c",
                        columnNames: ["email"],
                    },
                ],
            }),
            true // ifExists
        );
        // Create foreign key from user_entity to contact_information_entity
        await queryRunner.createForeignKey(
            "contact_information_entity",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user_entity",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop user_entity and contact_information_entity tables
        const table = await queryRunner.getTable("contact_information_entity");
        const userForeignKey = table.foreignKeys.find(
            fk => fk.columnNames.indexOf("userId") !== -1,
        );
        await queryRunner.dropForeignKey("contact_information_entity", userForeignKey);
        await queryRunner.query(`DROP TABLE "user_entity";`);
        await queryRunner.query(`DROP TABLE "contact_information_entity";`);
    }
}
