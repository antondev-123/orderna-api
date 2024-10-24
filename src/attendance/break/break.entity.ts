import { AttendanceEntity } from "src/attendance/attendance.entity";
import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class BreakEntity {
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "timestamptz" })
	start: Date;

	@Column({ type: "timestamptz" })
	end: Date;

	@Column()
	attendanceId: number;

	@ManyToOne(() => AttendanceEntity, attendance => attendance.breaks)
	attendance: AttendanceEntity;

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted break with id: ${this.id}`, context: BreakEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated break with id: ${this.id}`, context: BreakEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed break with id: ${this.id}`, context: BreakEntity.name });
	}
}
