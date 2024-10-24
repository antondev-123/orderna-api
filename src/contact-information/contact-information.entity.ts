import { winstonLoggerConfig } from "src/configs/winston-logger.config";
import { CustomerEntity } from "src/customer/customer.entity";
import { BaseEntity } from "src/db/entities/base.entity";
import { SupplierEntity } from "src/supplier/supplier.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { AfterInsert, AfterRemove, AfterUpdate, Column, Entity, JoinColumn, OneToOne, Unique } from "typeorm";

// Note: Based on contact numbers in the Philippines.
// Reference: https://en.wikipedia.org/wiki/Telephone_numbers_in_the_Philippines
export class MobileInformationEntity {
    @Column({ length: 3, nullable: true })
    countryCode?: string; // Country code for mobile

    @Column({ length: 10, nullable: true })
    number?: string; // Mobile number, 10 digits
}

export class TelephoneInformationEntity {
    @Column({ length: 3, nullable: true })
    countryCode?: string; // Country code for telephone

    @Column({ length: 9, nullable: true })
    number?: string; // Telephone number, 9 digits
}

// TODO: Consider adding to relevant entities as embedded columns
// Reference: https://typeorm.io/embedded-entities#
@Entity()
// TODO: Confirm if other unique constraints should be added here
// @Unique(["customer", "email"])
// @Unique(["supplier", "mobile.countryCode", "mobile.number"])
// @Unique(["supplier", "email"])
// @Unique(["supplier", "mobile.countryCode", "mobile.number"])
@Unique(["user", "email"])
@Unique(["user", "mobile.countryCode", "mobile.number"])
export class ContactInformationEntity extends BaseEntity {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    birthday?: Date;

    @Column(() => MobileInformationEntity)
    mobile: MobileInformationEntity;

    @Column(() => TelephoneInformationEntity)
    telephone: TelephoneInformationEntity;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    street?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    zipCode?: number;

    @Column({ nullable: true })
    company: string;

    //relations
    @OneToOne(() => UserEntity, user => user.contactInfo, { onDelete: "CASCADE" })
    @JoinColumn()
    user: UserEntity;

    @OneToOne(() => SupplierEntity, supplier => supplier.contactInfo, { onDelete: "CASCADE" })
    @JoinColumn()
    supplier: SupplierEntity;

    @OneToOne(() => CustomerEntity, customer => customer.contactInfo, { onDelete: "CASCADE" })
    @JoinColumn()
    customer: CustomerEntity;

    //hooks
    @AfterInsert()
    afterInsert() {
        winstonLoggerConfig.debug({ message: `Inserted contact information with id: ${this.id}`, context: ContactInformationEntity.name });
    }

    @AfterUpdate()
    afterUpdate() {
        winstonLoggerConfig.debug({ message: `Updated contact information with id: ${this.id}`, context: ContactInformationEntity.name });
    }

    @AfterRemove()
    afterRemove() {
        winstonLoggerConfig.debug({ message: `Removed general info with id: ${this.id}`, context: ContactInformationEntity.name });
    }
}
