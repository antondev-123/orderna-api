import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { errorResponseMessage } from "src/common/constants";
import { categoryResponseMessage } from "src/common/constants/response-messages/category.response-message";
import { pagination } from "src/common/dtos/pagination-default";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CategoryEntity } from "./category.entity";
import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { EditCategoryDto } from "./dtos/edit-category.dto";
import { CategoryIdDto } from "./dtos/params-category.dto";

@Injectable()
export class CategoryService {
	constructor(
		@InjectRepository(CategoryRepository)
		private categoryRepository: CategoryRepository,
	) { }

	async addCategory(createCategoryDto: CreateCategoryDto) {
		try {
			const categoryJson: any = new CategoryEntity();
			Object.assign(categoryJson, createCategoryDto);

			const category = this.categoryRepository.create(categoryJson);
			await this.categoryRepository.save(category);
			return category;
		} catch (error) {
			throw error;
		}
	}

	async editCategory(
		categoryIdDto: CategoryIdDto,
		editCategoryDto: EditCategoryDto,
	) {
		try {
			const category = await this.categoryRepository.findCategoryById(
				categoryIdDto.categoryId,
			);
			if (!category) {
				throw new NotFoundException(
					categoryResponseMessage.CATEGORY_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}
			Object.assign(category, editCategoryDto);
			await this.categoryRepository.save(category);
			return category;
		} catch (error) {
			throw error;
		}
	}

	async deleteCategory(categoryIdDto: CategoryIdDto) {
		try {
			const category = await this.categoryRepository.findCategoryById(
				categoryIdDto.categoryId,
			);
			if (!category) {
				throw new NotFoundException(
					categoryResponseMessage.CATEGORY_NOT_FOUND.EN,
					errorResponseMessage.NOT_FOUND.EN
				);
			}
			await this.categoryRepository.deleteCategory(category.id);
			return category;
		} catch (error) {
			throw error;
		}
	}

	async getCategoryList(paginationDto: PaginationDto) {
		try {
			const skip =
				((paginationDto.page ?? pagination.defaultPage) - 1) *
				(paginationDto.size ?? pagination.pageSize);
			const take = paginationDto.size ?? pagination.pageSize;

			const [category, total_record] =
				await this.categoryRepository.findCategoryList(
					paginationDto.search,
					skip,
					take,
				);
			if (!(category && category.length)) {
				return { category: [], total_record: 0 };
			}
			return { category: category, total_record: total_record };
		} catch (error) {
			throw error;
		}
	}
}
