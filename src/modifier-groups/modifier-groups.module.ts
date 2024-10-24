import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { ModifierGroupsEntity } from "./entities/modifier-groups.entity";
import { CategoryModule } from "src/category/category.module";
import { CommonModule } from "src/common/common.module";
import { ModifierGroupController } from "./modifier-groups.controller";
import { ModifierGroupService } from "./modifier-groups.service";
import { ModifierGroupsRepository } from "./repositories/modifier-groups.repository";
import { ModifierOptionsRepository } from "./repositories/modifier-options.repository";
import { ProductRepository } from "src/product/product.repository";
import { ModifierGroupsCategoryRepository } from "./repositories/modifier-groups-category.repository";

@Module({
	imports: [
		AuthModule,
		TypeOrmModule.forFeature([ModifierGroupsEntity]),
		CategoryModule,
		CommonModule,
	],
	controllers: [ModifierGroupController],
	providers: [
		ModifierGroupService,
		ModifierGroupsRepository,
		ModifierOptionsRepository,
		ProductRepository,
		ModifierGroupsCategoryRepository,
	],
	exports: [ModifierGroupsRepository],
})
export class ModifierModule {}
