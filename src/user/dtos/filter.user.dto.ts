import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsEmail,
	IsEnum,
	IsIn,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";
import { FilterPeriod } from "src/common/constants/enums/filter-period.enum";
import { UserRole } from "src/common/constants/enums/user-role.enum";
import { UserStatus } from "src/common/constants/enums/user-status.enum";
import { SortOrderDto } from "src/common/dtos/sort-order.dto";
import { getEntityColumns } from "src/common/utils/entity.util";
import { ContactInformationEntity } from "src/contact-information/contact-information.entity";
import { UserEntity } from "../entities/user.entity";

export class FilterUserDto extends SortOrderDto {
	@ApiPropertyOptional({
		example: "daniza_baltazar",
		description: "The username of the User",
	})
	@IsOptional()
	@IsString()
	username?: string;

	@ApiPropertyOptional({
		example: "azc.baltazar@arkconsult.com",
		description: "The email address of the User",
	})
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiPropertyOptional({
		example: FilterPeriod.TODAY,
		description: "The period for filtering users",
		enum: FilterPeriod,
	})
	@IsOptional()
	@IsEnum(FilterPeriod)
	period?: FilterPeriod;

	@ApiPropertyOptional({
		example: UserStatus.ACTIVE,
		description: "The status of the User",
		enum: UserStatus,
	})
	@IsOptional()
	@IsEnum(UserStatus)
	status?: UserStatus;

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
		]}`,
	})
	role?: UserRole;

	@ApiPropertyOptional({
		example: "createdAt",
		description: `The field to sort by. Must be one of: ${getEntityColumns(
			[UserEntity, ContactInformationEntity],
		).join(", ")}`,
	})
	@IsOptional()
	@IsString()
	@IsIn(getEntityColumns([UserEntity, ContactInformationEntity]))
	sortBy?: string;

	@ApiPropertyOptional({
		example: 10,
		description: "The number of results to return",
	})
	@Transform(({ value }) => parseInt(value, 10))
	@IsOptional()
	@IsNumber()
	limit?: number;
}
