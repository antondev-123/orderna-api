import { NotFoundException } from "@nestjs/common";
import { SalesRepository } from "../sales.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { errorResponseMessage } from "src/common/constants";
import { analyticsResponseMessage } from "src/common/constants/response-messages/analytics.response-message";
import { SalesTipsByDayService } from "./sales-tips-by-day.service";


describe("SalesTipsByDayService", () => {
    let service: SalesTipsByDayService;
    let repository: SalesRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SalesTipsByDayService,
                {
                    provide: SalesRepository,
                    useValue: {
                        getTipsByDay: jest.fn(),
                    }
                },
            ],
        }).compile();

        service = module.get<SalesTipsByDayService>(SalesTipsByDayService);
        repository = module.get<SalesRepository>(SalesRepository);
    });

    describe("getTipsByDay", () => {
        it("should return sales tips by day data when transactions are found", async () => {
            const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };
            const count = 10;
            const tipsByDay = [
                {
                    date: "2024-08-22",
                    tipsRevenue: 50,
                },
            ];
            const mockTipsByDay = { data: tipsByDay, count };

            jest.spyOn(repository, "getTipsByDay").mockResolvedValue(mockTipsByDay);

            const result = await service.getTipsByDay(filterData);

            expect(result).toEqual({
                tips: tipsByDay,
                pagination: {
                    totalPages: 1,
                    currentPage: 1,
                },
            });
        });

        it("should throw NotFoundException when no transactions are found", async () => {
            const filterData = { page: 1, limit: 10, toDate: new Date(), fromDate: new Date(), storeId: 1 };

            jest.spyOn(repository, "getTipsByDay").mockResolvedValue({ data: [], count: 0 });

            await expect(service.getTipsByDay(filterData)).rejects.toThrow(
                new NotFoundException(analyticsResponseMessage.ANALYTICS_TIPS_BY_DAY.EN, errorResponseMessage.NOT_FOUND.EN),
            );
        });
    });
});