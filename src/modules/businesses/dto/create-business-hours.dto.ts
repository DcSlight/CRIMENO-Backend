import { IsInt, IsNotEmpty, IsString, Matches, Min } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class CreateBusinessHoursDto {
  @IsInt()
  @Min(1)
  business_id!: number;

  @IsString()
  @IsNotEmpty()
  day_of_week!: string;

  @IsString()
  @Matches(TIME_REGEX, {
    message: 'opening_time must be in HH:mm or HH:mm:ss format',
  })
  opening_time!: string;

  @IsString()
  @Matches(TIME_REGEX, {
    message: 'closing_time must be in HH:mm or HH:mm:ss format',
  })
  closing_time!: string;
}
