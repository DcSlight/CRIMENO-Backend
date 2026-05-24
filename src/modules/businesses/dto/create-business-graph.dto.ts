import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import {
  ScoringLevel,
  SensitivityLevel,
} from '../../../database/entities/business-policy.entity';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class CreateBusinessHoursItemDto {
  @ApiProperty({
    example: 'monday',
    description: 'Day of the week for this schedule entry',
  })
  @IsString()
  @IsNotEmpty()
  day_of_week!: string;

  @ApiProperty({
    example: '09:00',
    description: 'Opening time in HH:mm or HH:mm:ss format',
  })
  @IsString()
  @Matches(TIME_REGEX, {
    message: 'opening_time must be in HH:mm or HH:mm:ss format',
  })
  opening_time!: string;

  @ApiProperty({
    example: '18:00',
    description: 'Closing time in HH:mm or HH:mm:ss format',
  })
  @IsString()
  @Matches(TIME_REGEX, {
    message: 'closing_time must be in HH:mm or HH:mm:ss format',
  })
  closing_time!: string;
}

export class CreateCameraItemDto {
  @ApiProperty({
    example: 'Front Entrance Cam',
  })
  @IsString()
  @IsNotEmpty()
  camera_name!: string;

  @ApiProperty({
    example: 'Mounted above the main entrance door',
  })
  @IsString()
  @IsNotEmpty()
  location_description!: string;
}

export class CreateBusinessPolicyItemDto {
  @ApiPropertyOptional({ enum: SensitivityLevel, example: SensitivityLevel.MEDIUM })
  @IsEnum(SensitivityLevel)
  @IsOptional()
  sensitivity_level?: SensitivityLevel;

  @ApiPropertyOptional({ enum: ScoringLevel, example: ScoringLevel.BALANCED })
  @IsEnum(ScoringLevel)
  @IsOptional()
  scoring_level?: ScoringLevel;

  @ApiPropertyOptional({ enum: SensitivityLevel, example: SensitivityLevel.MEDIUM })
  @IsEnum(SensitivityLevel)
  @IsOptional()
  interaction_sensitivity?: SensitivityLevel;

  @ApiPropertyOptional({
    type: [String],
    example: ['Customers browsing aisles'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowed_behaviors?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Entering staff-only areas'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  forbidden_behaviors?: string[];
}

export class CreateBusinessGraphDto {
  @ApiProperty({ example: 'Downtown Market' })
  @IsString()
  @IsNotEmpty()
  store_name!: string;

  @ApiProperty({ example: 'grocery' })
  @IsString()
  @IsNotEmpty()
  store_type!: string;

  @ApiProperty({
    example: 'Neighborhood store with fresh produce and daily essentials.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 'Toronto' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: '123 King St W' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({
    type: [CreateBusinessHoursItemDto],
    example: [
      {
        day_of_week: 'monday',
        opening_time: '09:00',
        closing_time: '18:00',
      },
      {
        day_of_week: 'tuesday',
        opening_time: '09:00',
        closing_time: '18:00',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessHoursItemDto)
  business_hours?: CreateBusinessHoursItemDto[];

  @ApiPropertyOptional({
    type: [CreateCameraItemDto],
    example: [
      {
        camera_name: 'Front Entrance Cam',
        location_description: 'Mounted above the main entrance door',
      },
      {
        camera_name: 'Checkout Cam',
        location_description: 'Ceiling camera facing the cashier area',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCameraItemDto)
  cameras?: CreateCameraItemDto[];

  @ApiPropertyOptional({
    type: CreateBusinessPolicyItemDto,
    example: {
      sensitivity_level: 'high',
      scoring_level: 'aggressive',
      interaction_sensitivity: 'medium',
      allowed_behaviors: ['customers chatting'],
      forbidden_behaviors: ['restricted area access'],
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBusinessPolicyItemDto)
  business_policy?: CreateBusinessPolicyItemDto;
}
