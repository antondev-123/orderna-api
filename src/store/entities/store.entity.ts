import { AttendanceEntity } from 'src/attendance/attendance.entity';
import { CashRegisterEntity } from 'src/cash-drawer/entities/cash-register.entity';
import { winstonLoggerConfig } from 'src/configs/winston-logger.config';
import { DiscountEntity } from 'src/discount/entities/discount.entity';
import { SupplierEntity } from 'src/supplier/supplier.entity';
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OpeningHours } from './opening-hours.entity';
import { MobileInformationEntity, TelephoneInformationEntity } from 'src/contact-information/contact-information.entity';

@Entity()
export class Store {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column()
  Name: string;

  @Column({ default: '' })
  Location: string;

  //TODO: take a look at the currency
  @Column({ default: 'USD' })
  Currency: string;

  @Column({ default: '' })
  About: string;

  @Column()
  Email: string;

  @Column(() => MobileInformationEntity)
  mobile: MobileInformationEntity;

  @Column(() => TelephoneInformationEntity)
  telephone: TelephoneInformationEntity;

  @Column({ default: '' })
  Website: string;

  @Column({ default: '' })
  StreetAddress: string;

  @Column({ default: '' })
  BuildingNameNumber: string;

  @Column({ default: '' })
  City: string;

  @Column({ default: '' })
  ZipCode: string;

  @Column({ default: '' })
  VATNumber: string;

  @Column({ default: true })
  IsOpen: boolean;

  //relations
  @OneToMany(() => OpeningHours, (openingHours) => openingHours.store)
  openingHours: OpeningHours[];

  @OneToMany(() => AttendanceEntity, attendances => attendances.store)
  attendances: AttendanceEntity[];

  @OneToMany(() => CashRegisterEntity, cashRegisterEntity => cashRegisterEntity.store)
  cashRegisterEntity: CashRegisterEntity[];

  @OneToMany(() => SupplierEntity, (supplier) => supplier.store)
  suppliers: SupplierEntity[];

  @OneToMany(() => DiscountEntity, (discount) => discount.discountId)
  discounts: DiscountEntity[];

  //hooks
  @AfterInsert()
  afterInsert() {
    winstonLoggerConfig.debug({ message: `Inserted store with id: ${this.id}`, context: Store.name });
  }

  @AfterUpdate()
  afterUpdate() {
    winstonLoggerConfig.debug({ message: `Updated store with id: ${this.id}`, context: Store.name });
  }

  @AfterRemove()
  afterRemove() {
    winstonLoggerConfig.debug({ message: `Removed store with id: ${this.id}`, context: Store.name });
  }
}
