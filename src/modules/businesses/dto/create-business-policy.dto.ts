import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  ScoringLevel,
  SensitivityLevel,
} from '../../../database/entities/business-policy.entity';

export class CreateBusinessPolicyDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  business_id!: number;

  @ApiProperty({ enum: SensitivityLevel, example: SensitivityLevel.MEDIUM })
  @IsEnum(SensitivityLevel)
  sensitivity_level!: SensitivityLevel;

  @ApiProperty({ enum: ScoringLevel, example: ScoringLevel.BALANCED })
  @IsEnum(ScoringLevel)
  scoring_level!: ScoringLevel;

  @ApiProperty({ enum: SensitivityLevel, example: SensitivityLevel.MEDIUM })
  @IsEnum(SensitivityLevel)
  interaction_sensitivity!: SensitivityLevel;

  @ApiPropertyOptional({
    type: [String],
    example: ['Employees carry boxes', 'People smoke near entrance'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowed_behaviors?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Touching the cash register', 'Opening emergency door'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  forbidden_behaviors?: string[];
}