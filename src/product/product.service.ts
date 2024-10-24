import { File } from "@nest-lab/fastify-multer";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from 'fs';
import * as path from "path";
import { CategoryRepository } from "src/category/category.repository";
import { categoryResponseMessage, errorResponseMessage, generalRepsonseMessage, productResponseMessage, storeResponseMessage } from "src/common/constants/response-messages";
import { pagination } from "src/common/dtos/pagination-default";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CustomLoggerService } from "src/common/services/custom-logger.service";
import { StoreRepository } from "src/store/repository/store.repository";
import { CreateProductDto } from "./dtos/create-product.dto";
import { EditProductDto } from "./dtos/edit-product.dto";
import { ProductIdDto } from "./dtos/params-product.dto";
import { ProductEntity } from "./product.entity";
import { ProductRepository } from "./product.repository";


@Injectable()
export class ProductService {
	private readonly CLASS_NAME = ProductService.name;
	constructor(
		private readonly logger: CustomLoggerService,
		@InjectRepository(ProductRepository)
		private productRepository: ProductRepository,
		@InjectRepository(CategoryRepository)
		private categoryRepository: CategoryRepository,
		@InjectRepository(StoreRepository)
		private storeRepository: StoreRepository,
	) {
		logger.setContext(this.CLASS_NAME);
	}


	async addProduct(file: File, createProductDto: CreateProductDto) {
		try {
			const store = await this.storeRepository.findStoreById(createProductDto.store)
			if (!store) {
				throw new NotFoundException(
					storeResponseMessage.STORE_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}
			const productJson: any = new ProductEntity();
			if (createProductDto.category) {
				const category = await this.categoryRepository.findCategoryById(createProductDto.category)
				if (!category) {
					throw new NotFoundException(
						categoryResponseMessage.CATEGORY_NOT_FOUND.EN,
						errorResponseMessage.NOT_FOUND.EN,
					);
				}
				productJson.category = category.id;
			}

			if (file) {
				const uploadPath = path.join(__dirname, '../..', 'uploads');
				if (!fs.existsSync(uploadPath)) {
					fs.mkdirSync(uploadPath);
				}
				const filePath = path.join(uploadPath, file.originalname);
				fs.writeFile(filePath, Buffer.from(file.buffer), (err) => {
					if (err) {
						this.logger.error({ message: `Error writing file:: ${err}`, stack: err.stack });
						throw new BadRequestException(
							generalRepsonseMessage.FILE_UPLOAD_FAILED,
							errorResponseMessage.BAD_REQUEST.EN,
						);
					} else {
						this.logger.log({ message: generalRepsonseMessage.FILE_WRITTEN });
					}
				})
				productJson.url = filePath
			}
			productJson.store = store.id
			Object.assign(productJson, createProductDto);

			const product = this.productRepository.create(productJson);
			await this.productRepository.save(product);
			return product;
		} catch (error) {
			throw error;
		}
	}

	async editProduct(
		productIdDto: ProductIdDto,
		editProductDto: EditProductDto,
	) {
		try {
			const product = await this.productRepository.findProductById(
				productIdDto.productId,
			);
			if (!product) {
				throw new NotFoundException(
					productResponseMessage.PRODUCT_NOT_FOUND,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}
			if (editProductDto.category) {
				const category: any = await this.categoryRepository.findCategoryById(
					editProductDto.category,
				);
				if (!category) {
					throw new NotFoundException(
						categoryResponseMessage.CATEGORY_NOT_FOUND,
						errorResponseMessage.NOT_FOUND.EN,
					);
				}
				product.category = category.id;
			}
			if (editProductDto.store) {
				const store: any = await this.storeRepository.findStoreById(
					editProductDto.store,
				);
				if (!store) {
					throw new NotFoundException(
						storeResponseMessage.STORE_NOT_FOUND,
						errorResponseMessage.NOT_FOUND.EN,
					);
				}
				product.store = store.id;
			}
			Object.assign(product, editProductDto);
			await this.productRepository.save(product);
			return product;
		} catch (error) {
			throw error;
		}
	}

	async deleteProduct(productIdDto: ProductIdDto) {
		try {
			const product = await this.productRepository.findProductById(
				productIdDto.productId,
			);
			if (!product) {
				throw new NotFoundException(
					productResponseMessage.PRODUCT_NOT_FOUND,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}

			await this.productRepository.deleteProduct(product.id);
			return product;
		} catch (error) {
			throw error;
		}
	}

	async getProductList(paginationDto: PaginationDto) {
		try {
			const skip =
				((paginationDto.page ?? pagination.defaultPage) - 1) *
				(paginationDto.size ?? pagination.pageSize);
			const take = paginationDto.size ?? pagination.pageSize;

			const [product, total_record] =
				await this.productRepository.findProductList(
					paginationDto.search,
					skip,
					take,
				);
			if (!(product && product.length)) {
				return { product: [], total_record: 0 };
			}
			return { product: product, total_record: total_record };
		} catch (error) {
			throw error;
		}
	}

	async getProductDetails(productIdDto: ProductIdDto) {
		try {
			const product = await this.productRepository.findProductDetailsById(
				productIdDto.productId,
			);
			if (!product) {
				throw new NotFoundException(
					productResponseMessage.PRODUCT_NOT_FOUND,
					errorResponseMessage.NOT_FOUND.EN,
				);
			}
			return product;
		} catch (error) {
			throw error;
		}
	}
}
