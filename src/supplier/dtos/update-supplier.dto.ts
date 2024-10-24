import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserStatus } from 'src/common/constants';
import { BaseContactNumbersDto } from 'src/common/dtos/contact-numbers/base-contact-numbers.dto';

export class UpdateSupplierDto extends PartialType(BaseContactNumbersDto) {

  @ApiPropertyOptional({
    example: 1,
    description: 'The ID of the store the customer is associated with.'
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  storeId: number;

  @ApiPropertyOptional({
    example: null,
    description: 'Status of the supplier to filter by',
    enum: UserStatus,
    nullable: true
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    example: 'Jung',
    description: 'The first name of the supplier'
  })
  @IsString()
  @IsOptional()
  supplierFirstName?: string;

  @ApiPropertyOptional({
    example: 'Jungwon',
    description: 'The last name of the supplier.'
  })
  @IsString()
  @IsOptional()
  supplierLastName?: string;

  @ApiPropertyOptional({
    example: 'Korean restaurant',
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
    description: 'The email address of the supplier',
  })
  @IsEmail()
  @IsString()
  @IsOptional()
  supplierEmail?: string;

  @ApiPropertyOptional({
    example: '123 supplier.',
    description: 'Any additional notes about the supplier'
  })
  @IsString()
  @IsOptional()
  supplierNote?: string;
}