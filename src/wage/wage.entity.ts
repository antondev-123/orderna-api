import { AttendanceEntity } from "src/attendance/attendance.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class WageEntity {
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@PrimaryGeneratedColumn()
	id!: number;

	@Column("float")
	ratePerHour: number;

	@Column()
	userId: number;

	@Column()
	attendanceId: number;

	@ManyToOne(() => AttendanceEntity, attendance => attendance.wages)
	attendance: AttendanceEntity;

	@ManyToOne(() => UserEntity, user => user.wages)
	user: UserEntity;
	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted wage with id: ${this.id}`, context: WageEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated wage with id: ${this.id}`, context: WageEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed wage with id: ${this.id}`, context: WageEntity.name });
	}
}
