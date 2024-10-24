import { AttendanceEntity } from "src/attendance/attendance.entity";
import { CashRegisterEntity } from "src/cash-drawer/entities/cash-register.entity";
import { UserRole } from "src/common/constants/enums/user-role.enum";
import { UserStatus } from "src/common/constants/enums/user-status.enum";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { WageEntity } from "src/wage/wage.entity";
import {
	AfterInsert,
	AfterRemove,
	AfterUpdate,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm";
import { winstonLoggerConfig } from "../../configs/winston-logger.config";

@Entity()
export class UserEntity {
	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deletedAt?: Date;

	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	username: string;

	@Column()
	password: string;

	//TODO:
	// link to wage table
	@Column({
		nullable: true,
	})
	wageId?: number;

	@Column({ type: "varchar", default: UserRole.ADMIN })
	role!: UserRole;

	// @Column("enum", {
	// 	default: UserStatus.ACTIVE,
	// 	enum: UserStatus,
	// })
	@Column({ type: "varchar", default: UserStatus.ACTIVE })
	status!: UserStatus;

	@Column({
		nullable: true,
	})
	pin?: number;


	//relations
	@OneToOne(() => ContactInformationEntity, contactInfo => contactInfo.user, {
		cascade: true,
	})
	contactInfo: ContactInformationEntity;

	@OneToMany(() => CashRegisterEntity, cashRegisterEntity => cashRegisterEntity.user)
	cashRegisterEntity: CashRegisterEntity[];

	@OneToMany(() => AttendanceEntity, attendances => attendances.user)
	attendances: AttendanceEntity[];

	@OneToMany(() => WageEntity, wages => wages.user)
	wages: WageEntity[];

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted user with id: ${this.id}`, context: UserEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated user with id: ${this.id}`, context: UserEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed user with id: ${this.id}`, context: UserEntity.name });
	}
}
