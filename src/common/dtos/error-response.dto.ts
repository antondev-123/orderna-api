import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { ErrorResponse } from "../interfaces/error-response.interface";

export class ErrorResponseDto implements ErrorResponse {
    @ApiProperty({
        description: 'Status code of the response',
        type: String,
    })
    @IsNumber()
    statusCode: number;

    @ApiProperty({
        description: 'A list of error messages',
        type: [String],
    })
    @IsString()
    message: string[];

    @ApiProperty({
        description: 'The error',
        type: String,
    })
    @IsString()
    error: string;
}