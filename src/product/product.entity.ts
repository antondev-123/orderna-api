import { CategoryEntity } from "src/category/category.entity";
import { winstonLoggerConfig } from "src/configs/winston-logger.config";
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
} from "typeorm";

@Entity()
export class ProductEntity extends BaseEntity {

	@Column({ nullable: false })
	title: string;

	@Column({ type: "float", nullable: false })
	cost: number;

	@Column({ type: "float", nullable: false })
	price: number;

	@Column({ type: "float", nullable: false })
	unit: number;

	@Column({ type: "float", nullable: true })
	stock: number;

	@Column({ nullable: true })
	sk_plu: string;

	@Column({ nullable: true })
	description: string;

	@Column({ nullable: true })
	url: string;

	@ManyToOne(() => CategoryEntity, { nullable: true })
	@JoinColumn({ name: "category", referencedColumnName: "id" })
	category: CategoryEntity;

	@ManyToOne(() => Store, { nullable: false })
	@JoinColumn({ name: "store", referencedColumnName: "id" })
	store: Store;

	//hooks
	@AfterInsert()
	afterInsert() {
		winstonLoggerConfig.debug({ message: `Inserted product with id: ${this.id}`, context: ProductEntity.name });
	}

	@AfterUpdate()
	afterUpdate() {
		winstonLoggerConfig.debug({ message: `Updated product with id: ${this.id}`, context: ProductEntity.name });
	}

	@AfterRemove()
	afterRemove() {
		winstonLoggerConfig.debug({ message: `Removed product with id: ${this.id}`, context: ProductEntity.name });
	}
}
