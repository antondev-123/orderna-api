import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import * as moment from 'moment';
import { AppModule } from "src/app.module";
import { discountResponseMessage, urlsConstant } from "src/common/constants";
import { CreateCustomerDto } from "src/customer/dtos/create-customer.dto";
import { CreateDiscountDto } from "src/discount/dtos/create-discount.dto";
import { GetAllDiscountDto } from "src/discount/dtos/get-all-discount.dto";
import { GetDiscountDto } from "src/discount/dtos/get-discount.dto";
import { DiscountEntity } from "src/discount/entities/discount.entity";
import { DiscountStatus } from "src/discount/enums/discount-status.enum";
import { DiscountType } from "src/discount/enums/discount-type.enum";
import { CreateStoreDto } from "src/store/dtos/create-store.dto";
import * as request from "supertest";
import { AuthUtil } from "./utils/auth.util";

describe("Discounts (e2e)", () => {
    let app: NestFastifyApplication;
    let authHeader: any;

    beforeEach(async () => {
        // await fs.mkdir('environments', { recursive: true }).catch(() => { });
        // await fs.writeFile('db.sqlite', '', 'utf8');
        // await fs.writeFile('test.sqlite', '', 'utf8');
        // await fs.writeFile(`environments/.env.${process.env.NODE_ENV}`, '', 'utf8');

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        );

        await app.init();
        await app.getHttpAdapter().getInstance().ready();

        await request(app.getHttpServer())
            .post('/stores')
            .send({
                Name: "SuperMart",
                Location: "Downtown",
                Currency: "USD",
                About: "A store that offers a variety of products at great prices.",
                Email: "info@supermart.com",
                mobile: { countryCode: "+63", number: "9876543210" },
                Website: "https://supermart.com",
                StreetAddress: "123 Market Street",
                BuildingNameNumber: "Building 4",
                City: "Metropolis",
                ZipCode: "54321",
                VATNumber: "VAT123456",
                IsOpen: true,
            } as CreateStoreDto);

        await request(app.getHttpServer())
            .post('/customer/add')
            .send({
                store: 1,
                firstName: "Jem",
                lastName: "Kim",
                mobile: { countryCode: '+63', number: "9988776654" },
            } as CreateCustomerDto);

        const authUtil = new AuthUtil(app);
        await authUtil.signUp();
        const response = await authUtil.login();
        authHeader = await authUtil.getAuthToken(response);
    });

    afterAll(async () => {
        await app.close();
    });

    it("[POST] /discounts", async () => {
        const res = await request(app.getHttpServer())
            .post("/discounts")
            .set(authHeader)
            .send({
                discountCode: "CODE" + moment().format('ssmmDD'),
                discountName: "Happy Days",
                storeIds: [
                    1,
                    2
                ],
                discountType: "Total Discount",
                discountValue: 20,
                discountStatus: "active",
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5
            })
        const data: CreateDiscountDto = res.body;
        expect(data['message'][0]).toEqual(discountResponseMessage.ADD_DISCOUNT.EN);
    });

    it("[GET] /discounts", async () => {
        const res = await request(app.getHttpServer())
            .get("/discounts")
            .set(authHeader)
            .query({ page: 1, limit: 10 })
            .expect(200);
        const data: GetAllDiscountDto = res.body;
        expect(data['message'][0]).toEqual(discountResponseMessage.GET_DISCOUNT_LIST.EN);
    });

    it("[GET] /discounts/:discountId", async () => {
        const discountId = await request(app.getHttpServer())
            .post("/discounts")
            .set(authHeader)
            .send({
                discountCode: "CODE" + moment().format('ssmmDD'),
                discountName: "Happy Days",
                storeIds: [
                    1,
                    2
                ],
                discountType: "Total Discount",
                discountValue: 20,
                discountStatus: "active",
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5
            })
            .then(res => res.body.discountId)

        const res = await request(app.getHttpServer())
            .get(`/discounts/${discountId}`)
        const data: GetDiscountDto = res.body;
        expect(data)
    });

    it("[PATCH] /discounts/:discountId", async () => {
        const payload = {
            discountCode: "VOIDCODE" + moment().format('mmss'),
            discountName: "Discount 1",
            storeId: [1],
            storeName: "Store 1",
            discountType: DiscountType.TOTAL_DISCOUNT,
            discountValue: 15,
            discountStatus: DiscountStatus.ACTIVE,
            startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
            endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
            minimumSpend: 10,
            limitOverall: 50,
            limitCustomer: 5
        }

        const discountId = await request(app.getHttpServer())
            .post("/discounts")
            .set(authHeader)
            .send(payload)
            .then(res => res.body.discountId)

        const res = await request(app.getHttpServer())
            .patch(`/discounts/${discountId}`)
            .send({
                ...payload,
                discountCode: "MOON" + moment().format('mmss'),
            })
        const data: DiscountEntity = res.body;
        expect(data)
    })

    it("[DELETE] /discounts/:discountId", async () => {
        const discountId = await request(app.getHttpServer())
            .post("/discounts")
            .set(authHeader)
            .send({
                discountCode: "VIP" + moment().format('mmss'),
                discountName: "Discount 1",
                storeId: [1],
                storeName: "Store 1",
                discountType: DiscountType.TOTAL_DISCOUNT,
                discountValue: 15,
                discountStatus: DiscountStatus.ACTIVE,
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5
            })
            .then(res => res.body.discountId);

        const res = await request(app.getHttpServer())
            .delete(`/discounts/${discountId}`)
        const data: DiscountEntity = res.body;
        expect(data)
    });

    it("[DELETE] /discounts", async () => {
        const resOne = await request(app.getHttpServer())
            .post("/discounts")
            .set(authHeader)
            .send({
                discountCode: "SUPERCODE" + moment().format('DDmmss'),
                discountName: "Discount 1",
                storeId: 1,
                storeName: "Store 1",
                discountType: "Total Discount",
                discountValue: 15,
                discountStatus: "active",
                startDate: "2024-07-09",
                endDate: "2024-07-09"
            });
        const dataOne: CreateDiscountDto = resOne.body;

        const resTwo = await request(app.getHttpServer())
            .post("/discounts")
            .set(authHeader)
            .send({
                discountCode: "SUPERCODE" + moment().format('mmssYY'),
                discountName: "Discount 1",
                storeId: 1,
                storeName: "Store 1",
                discountType: "Total Discount",
                discountValue: 15,
                discountStatus: "active",
                startDate: "2024-07-09",
                endDate: "2024-07-09"
            });
        const dataTwo: CreateDiscountDto = resTwo.body;

        await request(app.getHttpServer())
            .delete("/discounts")
            .set(authHeader)
            .query({ ids: [dataOne.discountId, dataTwo.discountId] })
    });

    it("[GET] /discounts/stores/:storeId", async () => {
        const res = await request(app.getHttpServer())
            .get("/discounts/stores/1")
            .set(authHeader)
        const data: any = res.body;

        expect(data['message'][0]).toEqual(discountResponseMessage.GET_DISCOUNT_STORES_LIST.EN);
    })

    // it("[GET] /discounts/check-discount", async () => {
    //     const discountCode = "CODE" + moment().format('ssmmDD')
    //     await request(app.getHttpServer())
    //         .post("/discounts")
    //         .send({
    //             discountCode: discountCode,
    //             discountName: "Happy Days",
    //             storeIds: [
    //                 1
    //             ],
    //             discountType: "Total Discount",
    //             discountValue: 20,
    //             discountStatus: "active",
    //             startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
    //             endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
    //             minimumSpend: 10,
    //             limitOverall: 50,
    //             limitCustomer: 5
    //         })

    //     const res = await request(app.getHttpServer())
    //         .get("/discounts/check-discount")
    //         .send({
    //             storeId: 1,
    //             customerId: 1,
    //             discountCode: discountCode,
    //             amount: 1000
    //         })
    //     const data: any = res.body;
    //     console.log(data);
    //     expect(data['message'][0]).toEqual(resMsgCons.DISCOUNT_MSG_AVAILABLE.EN);
    // })

    // it("[POST] /discounts/transaction", async () => {
    //     const discountCode = "CODE" + moment().format('ssmmDD')
    //     await request(app.getHttpServer())
    //         .post("/discounts")
    //         .send({
    //             discountCode: discountCode,
    //             discountName: "Happy Days",
    //             storeIds: [
    //                 1,
    //                 2
    //             ],
    //             discountType: "Total Discount",
    //             discountValue: 20,
    //             discountStatus: "active",
    //             startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
    //             endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
    //             minimumSpend: 10,
    //             limitOverall: 50,
    //             limitCustomer: 5
    //         })

    //     const res = await request(app.getHttpServer())
    //         .post("/discounts/transaction")
    //         .send({
    //             transactionId: 1,
    //             storeId: 1,
    //             customerId: 1,
    //             discountCode: discountCode,
    //             amount: 1000
    //         })
    //     const data: any = res.body;
    //     expect(data['message'][0]).toEqual(resMsgCons.DISCOUNT_USED.EN);
    // })

    it("[GET] /discounts/transaction/summary", async () => {
        const res = await request(app.getHttpServer())
            .get(`${urlsConstant.ROUTE_PREFIX_DISCOUNT}${urlsConstant.API_GET_DISCOUNTS_TRANSACTION_SUMMARY}`)
            .set(authHeader)
        const data: any = res.body;
        expect(data['message'][0]).toEqual(discountResponseMessage.GET_DISCOUNT_SUMMARY.EN);
    })

    it("[GET] /discounts/transaction/summary/:discountId", async () => {
        const discountCode = "CODE" + moment().format('ssmmDD')
        await request(app.getHttpServer())
            .post(`${urlsConstant.ROUTE_PREFIX_DISCOUNT}`)
            .set(authHeader)
            .send({
                discountCode: discountCode,
                discountName: "Happy Days",
                storeIds: [
                    1,
                    2
                ],
                discountType: "Total Discount",
                discountValue: 20,
                discountStatus: "active",
                startDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                endDate: `${moment().format('YYYY-MM-DD')}T07:00:00+07:00`,
                minimumSpend: 10,
                limitOverall: 50,
                limitCustomer: 5
            })

        await request(app.getHttpServer())
            .post(`${urlsConstant.ROUTE_PREFIX_DISCOUNT}${urlsConstant.API_GET_DISCOUNTS_TRANSACTION}`)
            .set(authHeader)
            .send({
                transactionId: 1,
                storeId: 1,
                customerId: 1,
                discountCode: discountCode,
                amount: 1000
            })

        const res = await request(app.getHttpServer())
            .get(`${urlsConstant.ROUTE_PREFIX_DISCOUNT}${urlsConstant.API_GET_DISCOUNTS_TRANSACTION_SUMMARY_ID.replace(':discountId', '1')}`)
            .set(authHeader)
        const data: any = res.body;
        //TODO: needs some restructuring
        // expect(data['message']).toEqual(discountResponseMessage.GET_DISCOUNT_SUMMARY.EN);
    })
});
