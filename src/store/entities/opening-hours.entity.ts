import { winstonLoggerConfig } from 'src/configs/winston-logger.config';
import { AfterInsert, AfterRemove, AfterUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity()
export class OpeningHours {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Store, (store) => store.openingHours, { onDelete: 'CASCADE' })
  store: Store;

  @Column()
  openingDayOfWeek: string;

  @Column('simple-array')
  openingTimeSlots: string[];

  @Column({ default: false })
  openingIsClosed: boolean;

  @Column({ default: false })
  openingIs24Hours: boolean;

  //hooks
  @AfterInsert()
  afterInsert() {
    winstonLoggerConfig.debug({ message: `Inserted opening hour with id: ${this.id}`, context: OpeningHours.name });
  }

  @AfterUpdate()
  afterUpdate() {
    winstonLoggerConfig.debug({ message: `Updated opening hour with id: ${this.id}`, context: OpeningHours.name });
  }

  @AfterRemove()
  afterRemove() {
    winstonLoggerConfig.debug({ message: `Removed opening hour with id: ${this.id}`, context: OpeningHours.name });
  }
}
