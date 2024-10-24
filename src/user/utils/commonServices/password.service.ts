import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

@Injectable()
export class PasswordService {
	async hashPassword(password: string): Promise<string> {
		const saltRounds = await bcrypt.genSalt(10);
		return await bcrypt.hash(password, saltRounds);
	}

	async comparePassword(password: string, hash: string): Promise<boolean> {
		return await bcrypt.compare(password, hash);
	}
}