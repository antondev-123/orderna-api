import { Expose } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

// TODO: Check if can be removed. Only used in unit test
export class SupplierDto {
  @ApiProperty({ example: 1 })
  @Expose()
  supplierID: number;

  @ApiProperty({ example: 'Jung' })
  @Expose()
  supplierFirstName: string;

  @ApiProperty({ example: 'Jungwon' })
  @Expose()
  supplierLastName: string;

  @ApiProperty({ example: 'Korean restaurant', required: false })
  @Expose()
  supplierCompany: string;

  @ApiProperty({ example: '12345' })
  @Expose()
  supplierZipCode: string;

  @ApiProperty({ example: 'Krakow', required: false })
  @Expose()
  supplierCity: string;

  @ApiProperty({ example: 'Random steert', required: false })
  @Expose()
  supplierStreet: string;

  @ApiProperty({ example: '+123456789' })
  @Expose()
  supplierMobilePhone: string;

  @ApiProperty({ example: '+987654321' })
  @Expose()
  supplierTelephone: string;

  @ApiProperty({ example: 'jungwon@example.com', required: false })
  @Expose()
  supplierEmail: string;

  @ApiProperty({ example: '123 supplier.' })
  @Expose()
  supplierNote: string;
}