import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { UnitEnum } from 'src/common/constants';
import { IsValidDateString } from 'src/common/validations/validation.filter';



export class CreatePurchaseDto {
    @ApiProperty({
        description: 'ID of the inventory item',
        example: 1,
    })
    @IsInt()
    @Transform(({ value }) => Number(value))
    inventoryItemID: number;

    @ApiProperty({
        description: 'ID of the store',
        example: 1,
    })
    @IsInt()
    @Transform(({ value }) => Number(value))
    storeID: number;

    @ApiProperty({
        description: 'ID of the supplier',
        example: 1,
    })
    @IsInt()
    @Transform(({ value }) => Number(value))
    supplierID: number;

    @ApiProperty({
        description: 'Date of purchase',
        example: '2024-08-21',

    })
    @IsValidDateString()
    purchaseDate: Date;

    @ApiPropertyOptional({
        description: 'Expiration date of the purchase',
        example: '2025-08-17',
    })
    @IsOptional()
    @IsValidDateString()
    expirationDate: Date;

    @ApiProperty({
        description: 'Price of the purchase',
        example: 100,
    })
    @IsInt()
    @Transform(({ value }) => Number(value))
    purchasePrice: number;

    @ApiProperty({
        description: 'Quantity of the items purchased',
        example: 6,
    })
    @IsInt()
    @Transform(({ value }) => Number(value))
    quantity: number;

    @ApiPropertyOptional({
        description: 'Additional notes for the purchase',
        example: 'This is purchase for table and chairs',
    })
    @IsOptional()
    @IsString()
    note: string;

    @ApiProperty({
        description: 'Unit of measurement for the quantity',
        enum: Object.values(UnitEnum),
        example: UnitEnum.Centimeter,
    })
    @IsString()
    @IsEnum(UnitEnum)
    unit?: UnitEnum;
}

export class UpdatePurchaseDto extends CreatePurchaseDto { }
