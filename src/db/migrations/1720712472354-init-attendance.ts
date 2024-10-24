import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitAttendance1720412472354 implements MigrationInterface {
    name = "InitAttendance1720412472354";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "break_entity",
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
                        name: "start",
                        type: "timestamptz",
                        isNullable: false,
                    },
                    {
                        name: "end",
                        type: "timestamptz",
                        isNullable: false,
                    },
                    {
                        name: "attendanceId",
                        type: "integer",
                        isNullable: false,
                    },
                ],
            }),
        );
        await queryRunner.createForeignKey(
            "break_entity",
            new TableForeignKey({
                columnNames: ["attendanceId"],
                referencedColumnNames: ["id"],
                referencedTableName: "attendance_entity",
                onDelete: "SET NULL",
            }),
        );

        await queryRunner.createTable(
            new Table({
                name: "attendance_entity",
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
                        name: "clockIn",
                        type: "timestamptz",
                        isNullable: false,
                    },
                    {
                        name: "clockOut",
                        type: "timestamptz",
                        isNullable: true,
                    },
                    {
                        name: "clockInImageUrl",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "clockOutImageUrl",
                        type: "varchar",
                        isNullable: true
                    },
                    {
                        name: "userId",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "storeId",
                        type: "integer",
                        isNullable: false,
                    },
                ],
            }),
        );
        await queryRunner.createForeignKey(
            "attendance_entity",
            new TableForeignKey({
                columnNames: ["storeId"],
                referencedColumnNames: ["id"],
                referencedTableName: "store",
                onDelete: "SET NULL",
            }),
        );

        await queryRunner.createForeignKey(
            "attendance_entity",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user_entity",
                onDelete: "SET NULL",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("attendance_entity");
        const userForeignKey = table.foreignKeys.find(
            fk => fk.columnNames.indexOf("userId") !== -1,
        );
        await queryRunner.dropForeignKey("attendance_entity", userForeignKey);
        const storeForeignKey = table.foreignKeys.find(
            fk => fk.columnNames.indexOf("storeId") !== -1,
        );
        await queryRunner.dropForeignKey("attendance_entity", storeForeignKey);
        await queryRunner.dropTable("attendance_entity");
    }
}
