import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CustomLoggerService extends Logger {
    private winstonContext: string;
    constructor(context?: string) {
        super(context);
    }

    setContext(context: string) {
        this.winstonContext = context;
    };

    log(message: any) {
        super.log(message, this.winstonContext);
    }
    error(message: any) {
        super.error(message, null, this.winstonContext);
    }
    warn(message: any) {
        super.warn(message, this.winstonContext);
    }
    debug(message: any) {
        super.debug(message, this.winstonContext);
    }
}