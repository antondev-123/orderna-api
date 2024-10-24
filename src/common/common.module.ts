import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./interceptors/Logging.interceptor";
import { CustomLoggerService } from "./services/custom-logger.service";

@Module({
    imports: [],
    controllers: [],
    providers: [
        CustomLoggerService,
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
    exports: [CustomLoggerService]
})
export class CommonModule { }