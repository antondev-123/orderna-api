import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject } from '@nestjs/common';
// import { Request, Response } from 'express';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorResponse } from 'src/common/interfaces/error-response.interface';
import { errorResponseMessage } from '../constants';
import { CustomLoggerService } from '../services/custom-logger.service';
import { fetchStatusCode } from '../utils/response.util';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(
        @Inject(CustomLoggerService) private readonly logger: CustomLoggerService
    ) { }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<FastifyRequest>();
        const { method, url } = req;
        const res = ctx.getResponse<FastifyReply>();
        const getStatusCodeFromResponse = exception.getResponse()["statusCode"];
        const statusCode = fetchStatusCode(
            exception && exception.getStatus()
                ? exception.getStatus()
                : getStatusCodeFromResponse,
        );
        const exceptionResponse: ErrorResponse = {
            message: exception.getResponse()["message"],
            statusCode: statusCode,
            error: exception.getResponse()["error"],
        };

        this.logger.error({
            message: exceptionResponse.message,
            request: { method, url },
            response: exceptionResponse,
            stack: exception.stack
        });

        if (statusCode && statusCode !== HttpStatus.INTERNAL_SERVER_ERROR) {
            return res
                .status(statusCode)
                .send(exceptionResponse);
        } else {
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send(<ErrorResponse>{
                    message: ["Contact the development team"],
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: errorResponseMessage.INTERNAL_SERVER_ERROR.EN
                });
        }
    }
}