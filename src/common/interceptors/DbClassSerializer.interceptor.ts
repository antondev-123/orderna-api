import {
	CallHandler,
	Logger,
	NestInterceptor,
	UseInterceptors
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export class DbClassSerializerInterceptor implements NestInterceptor {
	private readonly logger = new Logger(DbClassSerializerInterceptor.name);
	constructor(private dto: any) { }
	intercept(context: never, next: CallHandler): Observable<any> {
		// run something before a request is handled by the request handler
		return next.handle().pipe(
			map((data: any) => {
				this.logger.debug({ data });
				// run something before the response is sent out
				return plainToInstance(this.dto, data, {
					excludeExtraneousValues: true, // exclude any extra properties that are not defined in the DTO
				});
			}),
		);
	}
}

interface ClassConstructor {
	new(...args: any[]): object;
}

//decorator
export function DbClassSerializer(dto: ClassConstructor) {
	return UseInterceptors(new DbClassSerializerInterceptor(dto));
}
