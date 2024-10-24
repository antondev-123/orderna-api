import {
    FastifyAdapter,
    NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { AuthUtil } from "./utils/auth.util";

describe("OpeningHoursController (e2e)", () => {
    let app: NestFastifyApplication;
    let authHeader: any;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        );
        await app.init();
        await app.getHttpAdapter().getInstance().ready();

        const authUtil = new AuthUtil(app);
        await authUtil.signUp();
        const response = await authUtil.login();
        authHeader = await authUtil.getAuthToken(response);
    });

    afterAll(async () => {
        await app.close();
    });

    it("/opening-hours (GET)", () => {
        return request(app.getHttpServer())
            .get("/opening-hours")
            .set(authHeader)
            .expect(200)
            .expect(response => {
                expect(response.body.data).toBeInstanceOf(Array);
            });
    });
});