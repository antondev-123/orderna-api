import { ProductRepository } from "src/product/product.repository";
import { ModifierGroupService } from "./modifier-groups.service"
import { ModifierGroupsRepository } from "./repositories/modifier-groups.repository";
import { ModifierOptionsRepository } from "./repositories/modifier-options.repository";
import { CategoryRepository } from "src/category/category.repository";
import { ModifierGroupsCategoryRepository } from "./repositories/modifier-groups-category.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateModifierGroupDto } from "./dtos/create-modifier-groups.dto";
import { NotFoundException } from "@nestjs/common";
import { EditModifierGroupDto } from "./dtos/update-modifier-groups.dto";
import { ListModifierGroupDto } from "./dtos/list-modifier-groups.dto";
import { ModifierGroupsIdDto } from "./dtos/params-modifier-groups.dto";
import { ModifierGroupsEntity } from "./entities/modifier-groups.entity";

describe("ModifierGroupService", () => {
    let modifierGroupService: ModifierGroupService;
    let modifierGroupsRepository: ModifierGroupsRepository;
    let modifierOptionsRepository: ModifierOptionsRepository;
    let modifierGroupsCategoryRepository: ModifierGroupsCategoryRepository;
    let productRepository: ProductRepository;
    let categoryRepository: CategoryRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ModifierGroupService,
                {
                    provide: ModifierGroupsRepository,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findModifierGroup: jest.fn(),
                        deleteModifier: jest.fn(),
                        findModifierList: jest.fn(),
                        findModifierData: jest.fn()
                    }
                },
                {
                    provide: ModifierOptionsRepository,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findModifierOption: jest.fn(),
                        deleteModifierOption: jest.fn()
                    }
                },
                {
                    provide: ModifierGroupsCategoryRepository,
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                        deleteModifierCategory: jest.fn()
                    }
                },
                {
                    provide: ProductRepository,
                    useValue: {
                        findProductCategoryByIds: jest.fn(),
                        findProductById: jest.fn()
                    }
                },
                {
                    provide: CategoryRepository,
                    useValue: {
                        findCategoryByIds: jest.fn()
                    }
                }
            ]
        }).compile();

        modifierGroupService = module.get<ModifierGroupService>(ModifierGroupService);
        modifierGroupsRepository = module.get<ModifierGroupsRepository>(ModifierGroupsRepository);
        modifierOptionsRepository = module.get<ModifierOptionsRepository>(ModifierOptionsRepository);
        modifierGroupsCategoryRepository = module.get<ModifierGroupsCategoryRepository>(ModifierGroupsCategoryRepository);
        productRepository = module.get<ProductRepository>(ProductRepository);
        categoryRepository = module.get<CategoryRepository>(CategoryRepository);
    });

    it("should be defined", () => {
        expect(modifierGroupService).toBeDefined();
    });

    describe("addModifierGroup", () => {
        const createModifierGroupDto: Partial<CreateModifierGroupDto> = {
            title: "Sample Modifier Group",
            sku_plu: "SKU123",
            description: "Sample description",
            limit: 5,
            category: ["1", "2"],
            options: [
                { product: 1, price: 10.5 },
                { product: 2, price: 15.0 }
            ]
        };

        const categories = [
            { id: 1, title: "Category 1" },
            { id: 2, title: "Category 2" }
        ];

        const products = [
            { id: 1, title: "Product 1" },
            { id: 2, title: "Product 2" }
        ];

        it("should return not found if category does not exist", async () => {
            (categoryRepository.findCategoryByIds as jest.Mock).mockResolvedValue([categories[0]]);

            await expect(modifierGroupService.addModifier(createModifierGroupDto as any)).rejects.toThrow(NotFoundException);
        });

        it("should return not found if product does not exist", async () => {
            (categoryRepository.findCategoryByIds as jest.Mock).mockResolvedValue(categories);
            (productRepository.findProductCategoryByIds as jest.Mock).mockResolvedValue([products[0]]);

            await expect(modifierGroupService.addModifier(createModifierGroupDto as any)).rejects.toThrow(NotFoundException);
        });

        it("should add a new modifier group successfully", async () => {
            const savedModifierGroup = { ...createModifierGroupDto, id: 1 };
            const savedModifierGroupsCategory = categories.map(cat => ({
                modifier_group_id: 1,
                category_id: cat.id,
            }));
            const savedModifierOptions = createModifierGroupDto.options.map((option, index) => ({
                id: index + 1,
                product: products.find(p => p.id === option.product),
                group: savedModifierGroup,
                price: option.price,
            }));

            (categoryRepository.findCategoryByIds as jest.Mock).mockResolvedValue(categories);
            (productRepository.findProductCategoryByIds as jest.Mock).mockResolvedValue(products);
            (modifierGroupsRepository.create as jest.Mock).mockReturnValue(savedModifierGroup);
            (modifierGroupsRepository.save as jest.Mock).mockResolvedValue(savedModifierGroup);
            (modifierGroupsCategoryRepository.save as jest.Mock).mockResolvedValue(savedModifierGroupsCategory);
            (modifierOptionsRepository.save as jest.Mock).mockResolvedValue(savedModifierOptions);

            const result = await modifierGroupService.addModifier(createModifierGroupDto as any);
            expect(result).toEqual({
                modifierGroupJson: savedModifierGroup,
                categories: savedModifierGroupsCategory.map(cat => ({
                    id: cat.category_id,
                    title: categories.find(c => c.id === cat.category_id),
                })),
                options: savedModifierOptions.map(option => ({
                    id: option.id,
                    productId: option.product.id,
                    productTitle: products.find(p => p.id === option.product.id).title,
                    price: option.price,
                }))
            });
        });
    })

    describe("editModifierGroup", () => {
        const editModifierGroupDto: Partial<EditModifierGroupDto> = {
            title: "Updated Modifier Group",
            sku_plu: "SKU456",
            description: "Updated description",
            limit: 10,
            category: ["1", "2"],
            options: [
                { optionId: 1, product: 1, price: 12.5 },
                { optionId: 1, product: 3, price: 20.0 }
            ]
        };

        const categories = [
            { id: 1, title: "Category 1" },
            { id: 2, title: "Category 2" }
        ];

        const products = [
            { id: 1, title: "Product 1" },
            { id: 2, title: "Product 2" },
            { id: 3, title: "Product 3" }
        ];

        it("should return not found if modifier group does not exist", async () => {
            (modifierGroupsRepository.findModifierGroup as jest.Mock).mockResolvedValue(null);

            await expect(modifierGroupService.updateModifier({ modifierId: 1 }, editModifierGroupDto as any)).rejects.toThrow(NotFoundException);
        });

        it("should return not found if category does not exist", async () => {
            (modifierGroupsRepository.findModifierGroup as jest.Mock).mockResolvedValue({ id: 1 });
            (categoryRepository.findCategoryByIds as jest.Mock).mockResolvedValue([]);

            await expect(modifierGroupService.updateModifier({ modifierId: 1 }, editModifierGroupDto as any)).rejects.toThrow(NotFoundException);
        });

        it("should return not found if product does not exist", async () => {
            const existingModifierGroup = { id: 1, title: "Existing Modifier Group" };
            const editModifierGroupDto = {
                title: "Updated Title",
                category: ["1"],
                options: [
                    { optionId: 1, product: 1, price: 12.0 }
                ]
            };

            (modifierGroupsRepository.findModifierGroup as jest.Mock).mockResolvedValue(existingModifierGroup);
            (categoryRepository.findCategoryByIds as jest.Mock).mockResolvedValue(categories);
            (productRepository.findProductById as jest.Mock).mockResolvedValue(null);

            await expect(
                modifierGroupService.updateModifier({ modifierId: 1 }, editModifierGroupDto as any)
            ).rejects.toThrow(NotFoundException);
        });

        it("should update an existing modifier group successfully", async () => {
            const modifier = { id: 1, title: "Old Title", sku_plu: "SKU123", description: "Old Description", limit: 5 };
            const updatedModifier = { ...modifier, ...editModifierGroupDto };
            const savedModifierGroupsCategory = categories.map(cat => ({
                modifier_group_id: 1,
                category_id: cat.id,
            }));
            const savedModifierOptions = [
                { id: 1, product: products[0], group: updatedModifier, price: 12.5 },
                { id: 2, product: products[2], group: updatedModifier, price: 20.0 }
            ];

            (modifierGroupsRepository.findModifierGroup as jest.Mock).mockResolvedValue(modifier);
            (categoryRepository.findCategoryByIds as jest.Mock).mockResolvedValue(categories);
            (productRepository.findProductById as jest.Mock).mockResolvedValue(products[0]);
            (productRepository.findProductById as jest.Mock).mockResolvedValueOnce(products[2]);
            (modifierGroupsCategoryRepository.delete as jest.Mock).mockResolvedValue({});
            (modifierGroupsCategoryRepository.create as jest.Mock).mockReturnValue(savedModifierGroupsCategory);
            (modifierGroupsCategoryRepository.save as jest.Mock).mockResolvedValue(savedModifierGroupsCategory);
            (modifierOptionsRepository.findModifierOption as jest.Mock).mockResolvedValue(savedModifierOptions);
            (modifierOptionsRepository.save as jest.Mock).mockResolvedValue(savedModifierOptions);
            (modifierGroupsRepository.save as jest.Mock).mockResolvedValue(updatedModifier);

            const result = await modifierGroupService.updateModifier({ modifierId: 1 }, editModifierGroupDto as any);

            expect(result).toEqual(updatedModifier);
        });
    })

    describe("deleteModifier", () => {
        const mockModifier = {
            id: 1,
            title: 'Modifier 1',
            sku_plu: 'MOD123',
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Partial<ModifierGroupsEntity> as ModifierGroupsEntity;

        it("should delete a modifier successfully", async () => {
            const modifierGroupsIdDto: ModifierGroupsIdDto = { modifierId: 1 };

            jest.spyOn(modifierGroupsRepository, 'findModifierGroup').mockResolvedValue(mockModifier);
            jest.spyOn(modifierGroupsRepository, 'deleteModifier').mockResolvedValue(null);
            jest.spyOn(modifierOptionsRepository, 'deleteModifierOption').mockResolvedValue(null);
            jest.spyOn(modifierGroupsCategoryRepository, 'deleteModifierCategory').mockResolvedValue(null);

            const result = await modifierGroupService.deleteModifier(modifierGroupsIdDto);
            expect(result).toEqual(mockModifier);
        });

        it("should return not found if modifier does not exist", async () => {
            const modifierGroupsIdDto: ModifierGroupsIdDto = { modifierId: 1 };

            jest.spyOn(modifierGroupsRepository, 'findModifierGroup').mockResolvedValue(null);

            await expect(modifierGroupService.deleteModifier(modifierGroupsIdDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe("getModifierGroupList", () => {
        it("should return an empty list if no modifiers are found", async () => {
            (modifierGroupsRepository.findModifierList as jest.Mock).mockResolvedValue([[], 0]);

            const paginationDto: ListModifierGroupDto = { page: 1, size: 10, search: "" };
            const result = await modifierGroupService.getModifierGroupList(paginationDto);

            expect(result).toEqual({ modifier: [], total_record: 0 });
        });

        it("should calculate skip and take correctly based on pagination parameters", async () => {
            const paginationDto = { page: 2, size: 10, search: '' };

            const modifiers = [
                { id: 1, title: "Title1", option: "Product4" },
                { id: 1, title: "Title1", option: "Product1" },
                { id: 2, title: "Title2", option: "Product4" },
                { id: 2, title: "Title2", option: "Product1" },
            ];
            const totalRecords = 4;
            (modifierGroupsRepository.findModifierList as jest.Mock).mockResolvedValue([modifiers, totalRecords]);

            const result = await modifierGroupService.getModifierGroupList(paginationDto);

            expect(result).toEqual({
                modifier: [
                    {
                        id: 1,
                        title: "Title1",
                        option: ["Product4", "Product1"],
                    },
                    {
                        id: 2,
                        title: "Title2",
                        option: ["Product4", "Product1"],
                    },
                ],
                total_record: 4,
            });

            expect(modifierGroupsRepository.findModifierList).toHaveBeenCalledWith(paginationDto.search, 10, 10);
        });

        it("should calculate skip and take correctly based on pagination parameters with different values", async () => {
            const paginationDto: ListModifierGroupDto = { page: 2, size: 5, search: "test" };

            (modifierGroupsRepository.findModifierList as jest.Mock).mockResolvedValue([[], 0]);

            await modifierGroupService.getModifierGroupList(paginationDto);

            expect(modifierGroupsRepository.findModifierList).toHaveBeenCalledWith(
                paginationDto.search,
                5,
                5
            );
        });
    });

    describe('getModifierGroupById', () => {
        const mockModifierData = [
            {
                id: 1,
                title: "Modifier 1",
                sku_plu: "SKU123",
                option_limit: 3,
                description: "Modifier description",
                option: "Option 1",
                option_id: 1,
                category_id: 1,
                category: "Category 1",
            },
            {
                id: 1,
                title: "Modifier 1",
                sku_plu: "SKU123",
                option_limit: 3,
                description: "Modifier description",
                option: "Option 2",
                option_id: 2,
                category_id: 2,
                category: "Category 2",
            },
        ];

        const modifierGroupsIdDto: ModifierGroupsIdDto = { modifierId: 1 };

        it('should return grouped modifiers with options and categories', async () => {
            (modifierGroupsRepository.findModifierData as jest.Mock).mockResolvedValue(mockModifierData);

            const result = await modifierGroupService.getModifierGroupById(modifierGroupsIdDto);

            expect(result).toEqual([
                {
                    id: 1,
                    title: "Modifier 1",
                    sku_plu: "SKU123",
                    option_limit: 3,
                    description: "Modifier description",
                    option: [
                        { option_id: 1, option: "Option 1" },
                        { option_id: 2, option: "Option 2" },
                    ],
                    category: [
                        { category_id: 1, category: "Category 1" },
                        { category_id: 2, category: "Category 2" },
                    ],
                },
            ]);
        });

        it('should throw NotFoundException if modifier group is not found', async () => {
            (modifierGroupsRepository.findModifierData as jest.Mock).mockResolvedValue(null);

            await expect(modifierGroupService.getModifierGroupById(modifierGroupsIdDto)).rejects.toThrow(NotFoundException);
        });
    });

})