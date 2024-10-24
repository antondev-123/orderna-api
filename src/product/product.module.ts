import { FastifyMulterModule } from "@nest-lab/fastify-multer";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { CategoryModule } from "src/category/category.module";
import { CommonModule } from "src/common/common.module";
import { StoresModule } from "src/store/stores.module";
import { ProductController } from "./product.controller";
import { ProductEntity } from "./product.entity";
import { ProductRepository } from "./product.repository";
import { ProductService } from "./product.service";

@Module({
	imports: [
		AuthModule,
		TypeOrmModule.forFeature([ProductEntity]),
		CategoryModule,
		StoresModule,
		FastifyMulterModule,
		CommonModule
	],
	controllers: [ProductController],
	providers: [ProductService, ProductRepository],
	exports: [ProductRepository]
})
export class ProductModule { }
