import { UserStatus } from 'src/common/constants';
import { winstonLoggerConfig } from 'src/configs/winston-logger.config';
import { ContactInformationEntity } from 'src/contact-information/contact-information.entity';
import { BaseEntity } from 'src/db/entities/base.entity';
import { Store } from 'src/store/entities/store.entity';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToOne
} from 'typeorm';

@Entity('supplier')
export class SupplierEntity extends BaseEntity {
  @Column({
    type: "text",
    nullable: true,
  })
  supplierNote: string;

  @Column({ type: "varchar", default: UserStatus.ACTIVE })
  status!: UserStatus;

  //relations
  @OneToOne(() => ContactInformationEntity, contactInfo => contactInfo.supplier, {
    cascade: true,
  })
  contactInfo: ContactInformationEntity;

  //TODO: Change the relation to ManyToMany
  @ManyToOne(() => Store, (store) => store.suppliers)
  store: Store;

  //hooks
  @AfterInsert()
  afterInsert() {
    winstonLoggerConfig.debug({ message: `Inserted supplier with id: ${this.id}`, context: SupplierEntity.name });
  }

  @AfterUpdate()
  afterUpdate() {
    winstonLoggerConfig.debug({ message: `Updated supplier with id: ${this.id}`, context: SupplierEntity.name });
  }

  @AfterRemove()
  afterRemove() {
    winstonLoggerConfig.debug({ message: `Removed supplier with id: ${this.id}`, context: SupplierEntity.name });
  }
}
