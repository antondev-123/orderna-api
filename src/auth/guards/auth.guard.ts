import {
	CanActivate,
	ExecutionContext,
	Injectable,
	SetMetadata,
	UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import * as jwt from "jsonwebtoken";
import { errorResponseMessage } from "src/common/constants";
import { authResponseMessage } from "src/common/constants/response-messages/auth.response-message";
import { AuthRedisService } from "src/redis/services/auth-redis.service";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
	private readonly CLASS_NAME = AuthGuard.name;
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
		private readonly authRedisService: AuthRedisService,
		private readonly configService: ConfigService,
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException(
				authResponseMessage.TOKEN_NOT_FOUND.EN,
				errorResponseMessage.UNAUTHORIZED.EN
			);
		}

		try {
			const decodedToken = jwt.decode(token);
			const id = (decodedToken as jwt.JwtPayload).object?.id;
			const tokenFromRedis = await this.authRedisService.getTokenFromRedis(id);

			if (!tokenFromRedis) {
				throw new UnauthorizedException(
					authResponseMessage.UNAUTHORIZED_USER.EN,
					errorResponseMessage.UNAUTHORIZED.EN
				);
			}

			const parsedToken = JSON.parse(tokenFromRedis);

			if (parsedToken.accessToken !== token) {
				throw new UnauthorizedException(
					authResponseMessage.UNAUTHORIZED_USER.EN,
					errorResponseMessage.UNAUTHORIZED.EN
				);
			}

			const payload = await this.jwtService.verifyAsync(token, {
				secret: this.configService.get<string>("ACCESSTOKEN_SECRETKEY"),
			});
			request["user"] = payload;
			return true;
		} catch (error) {
			throw error;
		}
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const authorization = request.headers["authorization"];
		const token = authorization?.replace("Bearer ", "");
		return token;
	}
}
