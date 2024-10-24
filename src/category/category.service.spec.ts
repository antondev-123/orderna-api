import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CategoryEntity } from "./category.entity";
import { CategoryRepository } from "./category.repository";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { CategoryIdDto } from "./dtos/params-category.dto";

describe("CategoryService", () => {
	let categoryService: CategoryService;
	let repository: CategoryRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CategoryService,
				{
					provide: getRepositoryToken(CategoryRepository),
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						findCategoryById: jest.fn(),
						deleteCategory: jest.fn(),
						findCategoryList: jest.fn(),
					},
				},
			],
		}).compile();

		categoryService = module.get<CategoryService>(CategoryService);
		repository = module.get<CategoryRepository>(
			getRepositoryToken(CategoryRepository),
		);
	});

	it("should be defined", () => {
		expect(categoryService).toBeDefined();
	});

	describe("addCategory", () => {
		it("should add a new category successfully", async () => {
			const createCategoryDto: CreateCategoryDto = {
				name: "Category1",
				description: "This is new category",
			};
			(repository.create as jest.Mock).mockReturnValue(null);
			(repository.save as jest.Mock).mockResolvedValue(createCategoryDto);

			const result = await categoryService.addCategory(createCategoryDto);
			expect(result).toEqual(null);
		});
	});

	describe("editCategory", () => {
		it("should edit an existing category successfully", async () => {
			const categoryIdDto: CategoryIdDto = { categoryId: 1 };
			const editCategoryDto: any = { name: "New category" };

			const category = new CategoryEntity();
			category.id = 1;
			category.name = "Category 1";

			(repository.findCategoryById as jest.Mock).mockResolvedValue(category);
			(repository.save as jest.Mock).mockResolvedValue({
				...category,
				...editCategoryDto,
			});

			const result = await categoryService.editCategory(
				categoryIdDto,
				editCategoryDto,
			);
			expect(result.name).toBe(editCategoryDto.name);
		});

		it("should return not found if category does not exist", async () => {
			const categoryIdDto: CategoryIdDto = { categoryId: 1 };
			const editCategoryDto: any = { name: "New category" };

			(repository.findCategoryById as jest.Mock).mockResolvedValue(null);

			await expect(categoryService.editCategory(
				categoryIdDto,
				editCategoryDto,
			)).rejects.toThrow(NotFoundException);
			expect(repository.findCategoryById).toHaveBeenCalledWith(1);
		});
	});

	describe("deleteCategory", () => {
		it("should delete a category successfully", async () => {
			const categoryIdDto1: CategoryIdDto = { categoryId: 1 };

			const category1 = new CategoryEntity();
			category1.id = 1;
			category1.name = "Category1";
			category1.deletedAt = null;

			(repository.findCategoryById as jest.Mock).mockResolvedValue(category1);
			(repository.deleteCategory as jest.Mock).mockResolvedValue(null);
			const result = await categoryService.deleteCategory(categoryIdDto1);
			expect(result).toEqual(
				category1,
			);
		});

		it("should return not found if category does not exist", async () => {
			const categoryIdDto: CategoryIdDto = { categoryId: 1 };
			await expect(categoryService.deleteCategory(categoryIdDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("getCategoryList", () => {
		const categories: CategoryEntity[] = [
			{ id: 1, name: "horror" } as CategoryEntity,
			{ id: 2, name: "crime" } as CategoryEntity,
			{ id: 3, name: "comedy" } as CategoryEntity,
		];

		it("should return a list of categories", async () => {
			const paginationDto: Partial<PaginationDto> = {
				search: null,
				size: 5,
				page: 1,
			};
			const totalRecords = categories.length;
			(repository.findCategoryList as jest.Mock).mockResolvedValue([
				categories,
				totalRecords,
			]);
			const result = await categoryService.getCategoryList(paginationDto as any);
			expect(result).toEqual(
				{
					category: categories,
					total_record: totalRecords,
				},
			);
		});

		it("apply search", async () => {
			const paginationDto: Partial<PaginationDto> = {
				search: "c",
				size: 5,
				page: 1,
			};

			const filteredCategories = categories.filter(category =>
				category.name
					.toLowerCase()
					.includes(paginationDto.search.toLowerCase()),
			);
			const totalRecords = filteredCategories.length;
			(repository.findCategoryList as jest.Mock).mockResolvedValue([
				filteredCategories,
				totalRecords,
			]);
			const result = await categoryService.getCategoryList(paginationDto as any);
			expect(result).toEqual(
				{
					category: filteredCategories,
					total_record: totalRecords,
				},
			);
		});
	});
});
