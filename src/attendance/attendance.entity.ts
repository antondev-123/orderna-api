import { BreakEntity } from "src/attendance/break/break.entity";
import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { Store } from "src/store/entities/store.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { WageEntity } from "src/wage/wage.entity";
import {
	AfterInsert,
	AfterRemove,
	AfterUpdate,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm";

@Entity()
export class AttendanceEntity {
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	clockIn: Date;

	@Column({
		nullable: true,
	})
	clockOut: Date;

	@Column()
	clockInImageUrl: string;

	@Column({
		nullable: true,
	})
	clockOutImageUrl: string;

	@Column()
	userId: number;

	@Column()
	storeId: number;

	@OneToMany(() => BreakEntity, breaks => breaks.attendance)
	breaks?: BreakEntity[];

	@OneToMany(() => WageEntity, wages => wages.attendance)
	wages: WageEntity[];

	@ManyToOne(() => UserEntity, user => user.attendances)
	user: UserEntity;

	@ManyToOne(() => Store, store => store.attendances)
	store: Store;

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted attendance with id: ${this.id}`, context: AttendanceEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated attendance with id: ${this.id}`, context: AttendanceEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed attendance with id: ${this.id}`, context: AttendanceEntity.name });
	}
}
