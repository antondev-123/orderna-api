import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLoggerService } from '../services/custom-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

    constructor(private readonly logger: CustomLoggerService) {
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const response = context.switchToHttp().getResponse<FastifyReply>();
        const { method, url } = request;
        const controller = context.getClass().name;
        const handler = context.getHandler().name;

        this.logger.setContext(`${controller}#${handler}`);
        return next
            .handle()
            .pipe(
                tap(() => {
                    const statusCode = response.statusCode;
                    const message = response.raw.statusMessage;
                    this.logger.log({ message: message, request: { method, url }, response: { statusCode } });
                }));
    }

}
