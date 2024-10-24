import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { SuccessResponse } from "../interfaces/success-response.interface";

export class SuccessResponseDto implements SuccessResponse {
  @ApiProperty({
    description: 'Status code of the response',
    type: String,
  })
  @IsNumber()
  statusCode: number;

  @ApiProperty({
    description: 'A list of status messages',
    type: [String],
  })
  @IsString()
  message: string[];

  @ApiPropertyOptional({
    description: 'The type of data requested. Can be a single object or an array of objects.',
    type: Object
  })
  @IsOptional()
  data?: any;
}

