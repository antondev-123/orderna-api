import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { BaseEntity } from "src/db/entities/base.entity";
import { Store } from "src/store/entities/store.entity";
import {
	AfterInsert,
	AfterRemove,
	AfterUpdate,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
} from "typeorm";

@Entity()
export class CustomerEntity extends BaseEntity {
	@Column({ nullable: true })
	note: string

	//relations
	@OneToOne(() => ContactInformationEntity, contactInfo => contactInfo.customer, {
		cascade: true,
	})
	contactInfo: ContactInformationEntity;

	@ManyToOne(() => Store, { nullable: false })
	@JoinColumn({ name: "store", referencedColumnName: "id" })
	store: Store;

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted customer with id: ${this.id}`, context: CustomerEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated customer with id: ${this.id}`, context: CustomerEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed customer with id: ${this.id}`, context: CustomerEntity.name });
	}
}
