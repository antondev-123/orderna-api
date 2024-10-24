import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	generateAccessToken(object: object): string {
		const payload = { object };
		const secret = this.configService.get<string>("ACCESSTOKEN_SECRETKEY");
		const expiresIn = this.configService.get<string>("ACCESSTOKEN_EXPIRY_TIME");
		return this.jwtService.sign(payload, { secret, expiresIn });
	}

	generateRefreshToken(object: object): string {
		const payload = { object };
		const secret = this.configService.get<string>("REFRESHTOKEN_SECRETKEY");
		const expiresIn = this.configService.get<string>(
			"REFRESHTOKEN_EXPIRY_TIME",
		);
		return this.jwtService.sign(payload, { secret, expiresIn });
	}
}
