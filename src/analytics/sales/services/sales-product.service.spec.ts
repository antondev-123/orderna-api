import { NotFoundException } from "@nestjs/common";
import { SalesRepository } from "../sales.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { errorResponseMessage } from "src/common/constants";
import { analyticsResponseMessage } from "src/common/constants/response-messages/analytics.response-message";
import { SalesProductService } from "./sales-product.service";


describe("SalesProductService", () => {
    let service: SalesProductService;
    let repository: SalesRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SalesProductService,
                {
                    provide: SalesRepository,
                    useValue: {
                        getProducts: jest.fn(),
                    }
                },
            ],
        }).compile();

        service = module.get<SalesProductService>(SalesProductService);
        repository = module.get<SalesRepository>(SalesRepository);
    });

    describe("getProducts", () => {

        it("should return sales product data when transactions are found", async () => {
            const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
            const count = 10;
            const category = [
                {
                    product_title: "Product 1",
                    totalValue: 100,
                },
            ];
            const mockCategory = { data: category, count };

            jest.spyOn(repository, "getProducts").mockResolvedValue(mockCategory);

            const result = await service.getProducts(filterData);

            expect(result).toEqual({
                product: [
                    {
                        product_title: "Product 1",
                        order: 1,
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

            jest.spyOn(repository, "getProducts").mockResolvedValue({ data: [], count: 0 });

            await expect(service.getProducts(filterData)).rejects.toThrow(
                new NotFoundException(analyticsResponseMessage.ANALYTICS_PRODUCTS.EN, errorResponseMessage.NOT_FOUND.EN),
            );
        });
    });
});