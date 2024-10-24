import { ApiProperty } from "@nestjs/swagger";

export class FileUploadDto {
    @ApiProperty({ description: 'The product image file. This should be provided in jpg or png.', type: "string", format: "binary" })
    file: any;
}
