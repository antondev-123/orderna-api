import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
	IsEmail,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";
import { UserRole } from "src/common/constants/enums/user-role.enum";
import { UserStatus } from "src/common/constants/enums/user-status.enum";
import { BaseContactNumbersDto } from "src/common/dtos/contact-numbers/base-contact-numbers.dto";

export class UpdateUserDto extends PartialType(BaseContactNumbersDto) {
	@ApiPropertyOptional({
		example: "Daniza",
		description: "The first name of the User",
	})
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({
		example: "Baltazar",
		description: "The last name of the User",
	})
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiPropertyOptional({
		example: "azc.baltazar@arkconsult.com",
		description: "The email address of the User",
	})
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({
		example: UserRole.ADMIN,
		description: `The role of the User. Roles need to be either: ${[
			UserRole.ADMIN,
			UserRole.MANAGER,
			UserRole.CASHIER,
		].join(", ")}`,
		enum: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER],
	})
	@IsOptional()
	@IsEnum([UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER], {
		message: `Roles need to be either: ${[
			UserRole.ADMIN,
			UserRole.MANAGER,
			UserRole.CASHIER,
		].join(", ")}`,
	})
	role?: UserRole;

	@ApiPropertyOptional({
		example: UserStatus.ACTIVE,
		description: `The status of the User. Status need to be either: ${[
			UserStatus.ACTIVE,
			UserStatus.INACTIVE,
			UserStatus.BLOCKED,
			UserStatus.PENDING,
		].join(", ")}`,
		enum: [UserStatus.ACTIVE, UserStatus.INACTIVE],
	})
	@IsOptional()
	@IsEnum(UserStatus, {
		message: `Statuses need to be either: ${[
			UserStatus.ACTIVE,
			UserStatus.INACTIVE,
			UserStatus.BLOCKED,
			UserStatus.PENDING,
		].join(", ")}`,
	})
	status?: UserStatus;

	@ApiPropertyOptional({
		example: 12345,
		description: "The zip code of the User",
	})
	@IsOptional()
	@IsNumber()
	zip_code?: number;

	@ApiPropertyOptional({
		example: "Makati",
		description: "The city of the User",
	})
	@IsOptional()
	@IsString()
	city?: string;

	@ApiPropertyOptional({
		example: "Ayala Avenue",
		description: "The street of the User",
	})
	@IsOptional()
	@IsString()
	street?: string;

	@ApiPropertyOptional({
		example: 1,
		description: "The wage ID of the User",
	})
	@IsOptional()
	@IsNumber()
	wageId?: number;

	@ApiPropertyOptional({
		example: 1234,
		description: "The PIN of the User",
	})
	@IsOptional()
	@IsNumber()
	pin?: number;
}
