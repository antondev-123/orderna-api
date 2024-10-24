import { HttpException, HttpStatus } from "@nestjs/common";
import { errorResponseMessage } from "../constants";

export class RedisInitException extends HttpException {
    constructor(errorMessage: string) {
        super(errorMessage,
            HttpStatus.INTERNAL_SERVER_ERROR,
            {
                cause: new Error(),
                description: errorResponseMessage.INTERNAL_SERVER_ERROR.EN
            }
        );
    }
}