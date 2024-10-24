import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { CommonModule } from "src/common/common.module";
import { CategoryController } from "./category.controller";
import { CategoryEntity } from "./category.entity";
import { CategoryRepository } from "./category.repository";
import { CategoryService } from "./category.service";

@Module({
	imports: [
		CommonModule,
		AuthModule,
		TypeOrmModule.forFeature([CategoryEntity])
	],
	controllers: [CategoryController],
	providers: [CategoryService, CategoryRepository],
	exports: [CategoryRepository],
})
export class CategoryModule { }
