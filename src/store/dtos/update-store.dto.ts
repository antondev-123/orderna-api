import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateStoreDto } from './create-store.dto';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {
  @ApiPropertyOptional({
    example: 'Secondary Street Store',
    description: 'Name of the store'
  })
  Name?: string;

  @ApiPropertyOptional({
    example: '456 Secondary Street, Downtown',
    description: 'Location of the store'
  })
  Location?: string;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Currency used in the store'
  })
  Currency?: string;

  @ApiPropertyOptional({
    example: 'A fancy restaurant store that offers a variety of products.',
    description: 'Description about the store'
  })
  About?: string;

  @ApiPropertyOptional({
    example: 'amazing@example.com',
    description: 'Email address of the store'
  })
  Email?: string;

  @ApiPropertyOptional({
    example: '+63988953491',
    description: 'Phone number of the store'
  })
  PhoneNumber?: string;

  @ApiPropertyOptional({ example: 'https://www.secondarystorewebsite.com', description: 'Website of the store' })
  Website?: string;

  @ApiPropertyOptional({
    example: '456 Oak Avenue',
    description: 'Street address of the store'
  })
  StreetAddress?: string;

  @ApiPropertyOptional({
    example: 'Building 20',
    description: 'Building name or number of the store'
  })
  BuildingNameNumber?: string;

  @ApiPropertyOptional({
    example: 'Quezon City',
    description: 'City where the store is located'
  })
  City?: string;

  @ApiPropertyOptional({
    example: '3700',
    description: 'Zip code of the store'
  })
  ZipCode?: string;

  @ApiPropertyOptional({
    example: 'VAT12345678',
    description: 'VAT number of the store'
  })
  VATNumber?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Is the store open?'
  })
  IsOpen?: boolean;
}
