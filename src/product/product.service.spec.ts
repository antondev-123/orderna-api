import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { CategoryEntity } from "src/category/category.entity";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { CustomLoggerService } from "src/common/services/custom-logger.service";
import { Store } from "src/store/entities/store.entity";
import { StoreRepository } from "src/store/repository/store.repository";
import { CategoryRepository } from "../category/category.repository";
import { CreateProductDto } from "./dtos/create-product.dto";
import { ProductIdDto } from "./dtos/params-product.dto";
import { ProductEntity } from "./product.entity";
import { ProductRepository } from "./product.repository";
import { ProductService } from "./product.service";

describe("ProductService", () => {
	let productService: ProductService;
	let customLoggerService: CustomLoggerService;
	let productRepository: ProductRepository;
	let categoryRepository: CategoryRepository;
	let storeRepository: StoreRepository;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProductService,
				CustomLoggerService,
				{
					provide: ProductRepository,
					useValue: {
						create: jest.fn(),
						save: jest.fn(),
						findProductById: jest.fn(),
						deleteProduct: jest.fn(),
						findProductList: jest.fn(),
						findProductDetailsById: jest.fn(),
					},
				},
				{
					provide: CategoryRepository,
					useValue: {
						findCategoryById: jest.fn(),
					},
				},
				{
					provide: StoreRepository,
					useValue: {
						findStoreById: jest.fn(),
					},
				},
			],
		}).compile();

		productService = module.get<ProductService>(ProductService);
		productRepository = module.get<ProductRepository>(ProductRepository);
		categoryRepository = module.get<CategoryRepository>(CategoryRepository);
		storeRepository = module.get<StoreRepository>(StoreRepository);
		customLoggerService = module.get<CustomLoggerService>(CustomLoggerService);
	});

	it("should be defined", () => {
		expect(productService).toBeDefined();
	});

	describe("addProduct", () => {
		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		it("should add a new product successfully", async () => {
			const createProductDto: Partial<CreateProductDto> = {
				title: "Product 1",
				description: "This is a new product",
				price: 100,
				cost: 200,
				unit: 5,
				store: store.id
			};

			const file = {
				originalname: 'test.jpg',
				buffer: Buffer.from('test content'),
			} as any;

			(productRepository.create as jest.Mock).mockReturnValue(createProductDto);
			(productRepository.save as jest.Mock).mockResolvedValue(createProductDto);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);

			const result = await productService.addProduct(file, createProductDto as any);
			expect(result).toEqual(createProductDto,
			);
		});

		it("should return not found if category does not exist", async () => {
			// pass category id without creating it
			const store = new Store();
			store.id = 1;
			store.Name = 'SuperMart';
			store.Email = 'info@supermart.com';
			store.mobile = { countryCode: '+63', number: '9876543210' };

			const createProductDto: Partial<CreateProductDto> = {
				title: "Product 1",
				description: "This is a new product",
				price: 100,
				category: 1,
				store: store.id
			};
			const file = {
				originalname: 'test.jpg',
				buffer: Buffer.from('test content'),
			} as any;

			(categoryRepository.findCategoryById as jest.Mock).mockResolvedValue(
				null,
			);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);

			await expect(productService.addProduct(file, createProductDto as any)).rejects.toThrow(NotFoundException);
		});

		it("should return if given category exists", async () => {
			const category = new CategoryEntity();
			category.id = 1;
			category.name = "Category 1";

			const store = new Store();
			store.id = 1;
			store.Name = 'SuperMart';
			store.Email = 'info@supermart.com';
			store.mobile = { countryCode: '+63', number: '9876543210' };

			const createProductDto: Partial<CreateProductDto> = {
				title: "Product 1",
				description: "This is a new product",
				price: 100,
				cost: 200,
				unit: 5,
				store: store.id,
				category: category.id,
			};
			const file = {
				originalname: 'test.jpg',
				buffer: Buffer.from('test content'),
			} as any;

			(categoryRepository.findCategoryById as jest.Mock).mockResolvedValue(
				category,
			);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);

			const result = await productService.addProduct(file, createProductDto as any);
			expect(result).toEqual(
				undefined,
			);
		});

		it("should return not found if store does not exist", async () => {
			// pass store id without creating it
			const createProductDto: Partial<CreateProductDto> = {
				title: "Product 1",
				description: "This is a new product",
				price: 100,
				cost: 200,
				unit: 5,
				store: 2
			};

			const file = {
				originalname: 'test.jpg',
				buffer: Buffer.from('test content'),
			} as any;

			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(null);

			await expect(productService.addProduct(file, createProductDto as any)).rejects.toThrow(NotFoundException);
		});
	});

	describe("editProduct", () => {
		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		it("should edit an existing product successfully", async () => {
			const productIdDto: ProductIdDto = { productId: 1 };
			const editProductDto = { title: "Updated Product", price: 500 };

			const product = new ProductEntity();
			product.id = 1;
			product.title = "Product 1";
			product.price = 100;
			product.cost = 200;
			product.unit = 5;
			product.store = store.id as any;

			(productRepository.findProductById as jest.Mock).mockResolvedValue(
				product,
			);
			(productRepository.save as jest.Mock).mockResolvedValue({
				...product,
				...editProductDto,
			});
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);
			(productRepository.findProductDetailsById as jest.Mock).mockResolvedValue(product);

			const result = await productService.editProduct(
				productIdDto,
				editProductDto as any,
			);
			const updatedData = await productService.getProductDetails({
				productId: 1,
			});
			expect(updatedData.title).toBe(editProductDto.title);
			expect(result).toEqual(
				product,
			);
		});

		it("should return not found if product does not exist", async () => {
			const productIdDto: ProductIdDto = { productId: 1 };
			const editProductDto = { title: "Updated Product" };

			(productRepository.findProductById as jest.Mock).mockResolvedValue(null);

			await expect(productService.editProduct(
				productIdDto,
				editProductDto as any,
			)).rejects.toThrow(NotFoundException);
		});

		it("should return not found if category does not exist", async () => {
			const productIdDto: ProductIdDto = { productId: 1 };
			const editProductDto = { category: 9 };

			const product: any = new ProductEntity();
			product.id = 1;
			product.title = "Product 1";
			product.store = store.id as any;

			(productRepository.findProductById as jest.Mock).mockResolvedValue(
				product,
			);
			(categoryRepository.findCategoryById as jest.Mock).mockResolvedValue(
				null,
			);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);

			await expect(productService.editProduct(
				productIdDto,
				editProductDto as any
			)).rejects.toThrow(NotFoundException);
		});

		it("should update product data if given category exists", async () => {
			const productIdDto: ProductIdDto = { productId: 1 };
			const editProductDto = { category: 1 };

			const category = new CategoryEntity();
			category.id = 1;
			category.name = "Category 1";

			const product = new ProductEntity();
			product.id = 1;
			product.title = "Product 1";
			product.price = 100;
			product.cost = 200;
			product.unit = 5;
			product.store = store.id as any;

			(productRepository.findProductById as jest.Mock).mockResolvedValue(
				product,
			);
			(categoryRepository.findCategoryById as jest.Mock).mockResolvedValue(
				category,
			);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(store);
			(productRepository.findProductDetailsById as jest.Mock).mockResolvedValue(product);

			const result = await productService.editProduct(
				productIdDto,
				editProductDto as any,
			);
			const updatedData = await productService.getProductDetails({
				productId: 1,
			});
			expect(updatedData.category).toBe(editProductDto.category);
			expect(result).toEqual(
				product,
			);
		});

		it("should return not found if store does not exist", async () => {
			// pass store id without creating it
			const productIdDto: ProductIdDto = { productId: 1 };
			const editProductDto = { store: 2 };

			const product = new ProductEntity();
			product.id = 1;
			product.title = "Product 1";
			product.price = 100;
			product.cost = 200;
			product.unit = 5;
			product.store = store.id as any;

			(productRepository.findProductById as jest.Mock).mockResolvedValue(
				product,
			);
			(storeRepository.findStoreById as jest.Mock).mockResolvedValue(null);

			await expect(productService.editProduct(
				productIdDto,
				editProductDto as any,
			)).rejects.toThrow(NotFoundException);
		});
	});

	describe("deleteProduct", () => {
		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		it("should delete a product successfully", async () => {
			const productIdDto: ProductIdDto = { productId: 1 };

			const product = new ProductEntity();
			product.id = 1;
			product.title = "Test Product";
			product.store = store.id as any

			(productRepository.findProductById as jest.Mock).mockResolvedValue(
				product,
			);
			(productRepository.deleteProduct as jest.Mock).mockResolvedValue(null);

			const result = await productService.deleteProduct(productIdDto);
			expect(result).toEqual(
				product,
			);
		});

		it("should return not found if product does not exist", async () => {
			const productIdDto: ProductIdDto = { productId: 1 };

			(productRepository.findProductById as jest.Mock).mockResolvedValue(null);

			await expect(productService.deleteProduct(productIdDto)).rejects.toThrow(NotFoundException);
		});
	});

	describe("getProductList", () => {
		const store = new Store();
		store.id = 1;
		store.Name = 'SuperMart';
		store.Email = 'info@supermart.com';
		store.mobile = { countryCode: '+63', number: '9876543210' };

		const store1 = new Store();
		store1.id = 2;
		store1.Name = 'SuperMart';
		store1.Email = 'info@supermart.com';
		store1.mobile = { countryCode: '+63', number: '9876543211' };

		const products: ProductEntity[] = [
			{
				id: 1,
				title: "Product 1",
				price: 100,
				cost: 200,
				unit: 4,
				store: store.id as any
			} as ProductEntity,
			{
				id: 2,
				title: "Product 2",
				price: 150,
				cost: 300,
				unit: 12,
				store: store.id as any
			} as ProductEntity,
			{
				id: 2,
				title: "New Product",
				price: 150,
				cost: 300,
				unit: 12,
				store: store1.id as any
			} as ProductEntity,
			{
				id: 2,
				title: "Test Product",
				price: 150,
				cost: 300,
				unit: 12,
				store: store1.id as any
			} as ProductEntity,
		];

		it("should return a list of products", async () => {
			const paginationDto: Partial<PaginationDto> = {
				page: 1,
				size: 5,
			};

			const totalRecords = products.length;
			(productRepository.findProductList as jest.Mock).mockResolvedValue([
				products,
				totalRecords,
			]);

			const result = await productService.getProductList(paginationDto as any);
			expect(result).toEqual(
				{
					product: products,
					total_record: totalRecords,
				},
			);
		});

		it("apply search", async () => {
			const paginationDto: Partial<PaginationDto> = {
				search: "Ne",
				page: 1,
				size: 5,
			};

			const filteredProducts = products.filter(product =>
				product.title
					.toLowerCase()
					.includes(paginationDto.search.toLowerCase()),
			);
			const totalRecords = filteredProducts.length;

			(productRepository.findProductList as jest.Mock).mockResolvedValue([
				filteredProducts,
				totalRecords,
			]);

			const result = await productService.getProductList(paginationDto as any);
			expect(result).toEqual(
				{
					product: filteredProducts,
					total_record: totalRecords,
				},
			);
		});
	});

	describe("getProductDetails", () => {
		it("should return product details", async () => {
			const productIdDto: ProductIdDto = { productId: 1 };
			const store = new Store();
			store.id = 1;
			store.Name = 'SuperMart';
			store.Email = 'info@supermart.com';
			store.mobile = { countryCode: '+63', number: '9876543210' };

			const product = new ProductEntity();
			product.id = 1;
			product.title = "Test Product";
			product.store = store.id as any

			(productRepository.findProductById as jest.Mock).mockResolvedValue(
				product,
			);
			(productRepository.findProductDetailsById as jest.Mock).mockResolvedValue(product);

			const result = await productService.getProductDetails(productIdDto);
			expect(result).toEqual(product,
			);
		});

		it("should return not found if product does not exist", async () => {
			const productIdDto: ProductIdDto = { productId: 1 };

			(productRepository.findProductById as jest.Mock).mockResolvedValue(null);

			await expect(productService.getProductDetails(productIdDto)).rejects.toThrow(NotFoundException);
		});
	});
});