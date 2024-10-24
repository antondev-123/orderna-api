import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AttendanceIdDto {
    @ApiProperty({
        example: 1,
        description: 'The unique identifier of the attendance record. This field is required.'
    })
    @IsNotEmpty()
    attendanceId: number;
}
