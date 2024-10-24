import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
    IsEmail,
    IsEnum,
    IsString,
    IsStrongPassword,
} from "class-validator";
import { UserRole } from "src/common/constants/enums/user-role.enum";
import { BaseContactNumbersDto } from "src/common/dtos/contact-numbers/base-contact-numbers.dto";

export class CreateUserDto extends PartialType(BaseContactNumbersDto) {
    @ApiProperty({
        example: "daniza_baltazar",
        description: "The username of the User",
    })
    @IsString()
    username: string;

    @ApiProperty({
        example: "$passwordHere$252810",
        description: "A strong password for the User",
    })
    @IsString()
    @IsStrongPassword()
    password: string;

    @ApiProperty({
        example: "azc.baltazar@arkconsult.com",
        description: "The email address of the User",
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "daniza",
        description: "The first name of the User",
    })
    @IsString()
    firstName: string;

    @ApiProperty({
        example: "baltazar",
        description: "The last name of the User",
    })
    @IsString()
    lastName: string;

    @ApiPropertyOptional({
        example: UserRole.ADMIN,
        description: `The role of the User. Roles need to be either: ${[
            UserRole.ADMIN,
            UserRole.MANAGER,
            UserRole.CASHIER,
        ].join(", ")}`,
        enum: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER],
    })
    @IsEnum([UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER], {
        message: `Roles need to be either: ${[UserRole.ADMIN, UserRole.MANAGER, UserRole.CASHIER]}`,
    })
    role: UserRole;
}