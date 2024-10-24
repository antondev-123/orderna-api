import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitBreak1721049578314 implements MigrationInterface {

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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("break_entity");
        const attendanceForeignKey = table.foreignKeys.find(
            fk => fk.columnNames.indexOf("attendanceId") !== -1,
        );
        await queryRunner.dropForeignKey("break_entity", attendanceForeignKey);
        await queryRunner.dropTable("break_entity");
    }

}
