import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class UpdateBusinessHoursDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  business_id?: number;

  @IsString()
  @IsOptional()
  day_of_week?: string;

  @IsString()
  @Matches(TIME_REGEX, {
    message: 'opening_time must be in HH:mm or HH:mm:ss format',
  })
  @IsOptional()
  opening_time?: string;

  @IsString()
  @Matches(TIME_REGEX, {
    message: 'closing_time must be in HH:mm or HH:mm:ss format',
  })
  @IsOptional()
  closing_time?: string;
}
