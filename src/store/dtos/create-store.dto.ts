import { ApiProperty, ApiPropertyOptional, IntersectionType, PartialType, PickType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { BaseContactNumbersDto } from 'src/common/dtos/contact-numbers/base-contact-numbers.dto';

export class CreateStoreDto extends IntersectionType(
  PickType(BaseContactNumbersDto, ['mobile']),
  PartialType(PickType(BaseContactNumbersDto, ['telephone']))
) {
  @ApiProperty({
    example: 'Main Street Store',
    description: 'Name of the store'
  })
  @IsString()
  Name: string;

  @ApiProperty({
    example: '123 Main Street, Downtown',
    description: 'Location of the store'
  })
  @IsString()
  Location: string;

  @ApiProperty({
    example: 'PHP',
    description: 'Currency used in the store'
  })
  @IsString()
  Currency: string;

  @ApiProperty({
    example: 'A cozy corner store that offers a variety of products.',
    description: 'Description about the store'
  })
  @IsString()
  About: string;

  @ApiProperty({
    example: 'store@example.com',
    description: 'Email address of the store'
  })
  @IsEmail()
  Email: string;

  @ApiPropertyOptional({
    example: 'https://www.storewebsite.com',
    description: 'Website of the store'
  })
  @IsString()
  @IsOptional()
  Website?: string;

  @ApiProperty({
    example: '456 Oak Avenue',
    description: 'Street address of the store'
  })
  @IsString()
  StreetAddress: string;

  @ApiProperty({
    example: 'Building 8',
    description: 'Building name or number of the store'
  })
  @IsString()
  BuildingNameNumber: string;

  @ApiProperty({
    example: 'Springfield',
    description: 'City where the store is located'
  })
  @IsString()
  City: string;

  @ApiProperty({
    example: '12345',
    description: 'Zip code of the store'
  })
  @IsString()
  ZipCode: string;

  @ApiPropertyOptional({
    example: '123-456-789-001',
    description: 'VAT number of the store'
  })
  @IsString()
  @IsOptional()
  VATNumber?: string;

  @ApiProperty({
    example: true,
    description: 'Is the store open?'
  })
  @IsBoolean()
  IsOpen: boolean;
}
