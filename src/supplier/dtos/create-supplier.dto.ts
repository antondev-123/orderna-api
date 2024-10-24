import { ApiProperty, ApiPropertyOptional, IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserStatus } from 'src/common/constants';
import { BaseContactNumbersDto } from 'src/common/dtos/contact-numbers/base-contact-numbers.dto';

export class CreateSupplierDto extends IntersectionType(
  PickType(BaseContactNumbersDto, ['mobile']),
  PartialType(PickType(BaseContactNumbersDto, ['telephone']))
) {
  @ApiProperty({
    example: 1,
    description: 'The ID of the store the customer is associated with.'
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  storeId: number;

  @ApiProperty({
    example: UserStatus.ACTIVE,
    description: 'Status of the supplier to filter by',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    nullable: true
  })
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    example: 'Jung',
    description: 'The first name of the supplier'
  })
  @IsString()
  @IsNotEmpty()
  supplierFirstName: string;

  @ApiProperty({
    example: 'Jungwon',
    description: 'The last name of the supplier'
  })
  @IsString()
  @IsNotEmpty()
  supplierLastName: string;

  @ApiPropertyOptional({
    example: 'Korean restuarntt',
    description: 'The company name associated with the supplier, if any'
  })
  @IsString()
  @IsOptional()
  supplierCompany?: string;

  @ApiPropertyOptional({
    example: '12345',
    description: 'The postal code of the supplier\'s address'
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  supplierZipCode?: number;

  @ApiPropertyOptional({
    example: 'Krakow',
    description: 'The city where the supplier is located'
  })
  @IsString()
  @IsOptional()
  supplierCity?: string;

  @ApiPropertyOptional({
    example: 'Random steert',
    description: 'The street address of the supplier'
  })
  @IsString()
  @IsOptional()
  supplierStreet?: string;

  @ApiPropertyOptional({
    example: 'jungwon@example.com',
    description: 'The email address of the supplier'
  })
  @IsEmail()
  @IsOptional()
  supplierEmail?: string;

  @ApiPropertyOptional({
    example: 'note to supplier.',
    description: 'Any additional notes about the supplier'
  })
  @IsString()
  @IsOptional()
  supplierNote?: string;
}