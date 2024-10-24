import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { DaysOfWeek } from '../../common/constants/enums/days-of-week.enum';

class TimeSlot {
  @ApiProperty({
    example: '08:00-12:00',
    description: 'Time slot (e.g., 08:00-12:00)'
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Invalid time slot format' })
  timeSlot: string;
}

export class CreateOpeningHoursDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the store'
  })
  @IsInt()
  storeID: number;

  @ApiProperty({
    example: DaysOfWeek.MONDAY,
    description: 'Day of the week',
    enum: DaysOfWeek
  })
  @IsEnum(DaysOfWeek)
  openingDayOfWeek: DaysOfWeek;

  @ApiProperty({
    example: [{ timeSlot: '08:00-12:00' }, { timeSlot: '13:00-18:00' }],
    description: 'Time slots for opening hours', type: [TimeSlot]
  })
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  openingTimeSlots: TimeSlot[];

  @ApiPropertyOptional({
    example: false,
    description: 'Is the store closed during this time slot?',
  })
  @IsBoolean()
  @IsOptional()
  openingIsClosed?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Is the store open 24 hours?',
  })
  @IsBoolean()
  @IsOptional()
  openingIs24Hours?: boolean;
}
