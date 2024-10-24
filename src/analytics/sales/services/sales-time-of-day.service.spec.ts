import { SalesRepository } from "../sales.repository";
import { Test, TestingModule } from "@nestjs/testing";
import { SalesTimeOfDayService } from "./sales-time-of-day.service";


describe("SalesTimeOfDayService", () => {
    let service: SalesTimeOfDayService;
    let repository: SalesRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SalesTimeOfDayService,
                {
                    provide: SalesRepository,
                    useValue: {
                        getTimeOfDay: jest.fn(),
                    }
                },
            ],
        }).compile();

        service = module.get<SalesTimeOfDayService>(SalesTimeOfDayService);
        repository = module.get<SalesRepository>(SalesRepository);
    });

    describe("getTimeOfDay", () => {
        it("should return sales time of day", async () => {
            const filterData = { page: 1, limit: 1, toDate: new Date(), fromDate: new Date(), storeId: 1 };
            const count = 10;
            const timeOfDay = [
                {
                    time_of_day: "12.00 AM",
                    orders: 1,
                    gross_sales: 100,
                },
            ];

            jest.spyOn(repository, "getTimeOfDay").mockResolvedValue(timeOfDay);

            const result = await service.getTimeOfDay(filterData);

            expect(result).toEqual(timeOfDay);
        });
    });
});