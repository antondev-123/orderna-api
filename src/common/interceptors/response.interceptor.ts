import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { isNotEmptyObject } from 'class-validator';
import { FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { winstonLoggerConfig } from "../../configs/winston-logger.config";
import { errorResponseMessage } from '../constants';
import { createSuccessResponse } from '../utils/response.util';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    private statusCode: number,
    private message: any,
    private data?: any
  ) {
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<FastifyReply>();
    return next.handle().pipe(
      map((incomingData: any) => {
        //TODO: build factory to catch stream and determine type 
        try {
          let successResponseDto = createSuccessResponse(
            this.statusCode,
            this.data,
            this.message,
          );
          if (isNotEmptyObject(successResponseDto.data)) {
            const dtoInstance = plainToInstance(successResponseDto.data, incomingData, {
              excludeExtraneousValues: true, // exclude any extra properties that are not defined in the DTO
            });
            successResponseDto.data = dtoInstance;
            return response.status(this.statusCode).send(successResponseDto);
          } else { //TODO: Get rid of this. Every response of a controller method should have a dto.
            successResponseDto.data = incomingData;
            return response.status(this.statusCode).send(successResponseDto);
          }
        } catch (error) {
          winstonLoggerConfig.error({ message: "Internal Server Error: ", stack: error });
          throw new InternalServerErrorException(
            "Contact the developers as there might be something wrong with the server.",
            errorResponseMessage.INTERNAL_SERVER_ERROR.EN,
          );
        }
      }),
    );
  }
}