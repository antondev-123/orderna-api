import { NotFoundException } from "@nestjs/common";
import { SalesRepository } from "../sales.repository";
import { SalesCategoryService } from "./sales-category.service";
import { Test, TestingModule } from "@nestjs/testing";
import { errorResponseMessage } from "src/common/constants";
import { analyticsResponseMessage } from "src/common/constants/response-messages/analytics.response-message";


describe("SalesCategoryService", () => {
    let service: SalesCategoryService;
    let repository: SalesRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SalesCategoryService,
                {
                    provide: SalesRepository,
                    useValue: {
                        getCategories: jest.fn(),
                    }
                },
            ],
        }).compile();

        service = module.get<SalesCategoryService>(SalesCategoryService);
        repository = module.get<SalesRepository>(SalesRepository);
    });

    describe("getCategories", () => {

        it("should return sales category data when transactions are found", async () => {
            const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
            const count = 10;
            const category = [
                {
                    category_name: "Category 1",
                    totalValue: 100,
                },
            ];
            const mockCategory = { data: category, count };

            jest.spyOn(repository, "getCategories").mockResolvedValue(mockCategory);

            const result = await service.getCategories(filterData);

            expect(result).toEqual({
                category: [
                    {
                        category_name: "Category 1",
                        sold: 1,
                        revenue: 100,
                    }
                ],
                pagination: {
                    totalPages: 1,
                    currentPage: 1,
                },
            });
        });

        it("should throw NotFoundException when no transactions are found", async () => {
            const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };

            jest.spyOn(repository, "getCategories").mockResolvedValue({ data: [], count: 0 });

            await expect(service.getCategories(filterData)).rejects.toThrow(
                new NotFoundException(analyticsResponseMessage.ANALYTICS_CATEGORIES.EN, errorResponseMessage.NOT_FOUND.EN),
            );
        });
    });
});