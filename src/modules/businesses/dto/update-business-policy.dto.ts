import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateBusinessPolicyDto {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  business_id?: number;

  @ApiPropertyOptional({ enum: SensitivityLevel, example: SensitivityLevel.HIGH })
  @IsEnum(SensitivityLevel)
  @IsOptional()
  sensitivity_level?: SensitivityLevel;

  @ApiPropertyOptional({ enum: ScoringLevel, example: ScoringLevel.AGGRESSIVE })
  @IsEnum(ScoringLevel)
  @IsOptional()
  scoring_level?: ScoringLevel;

  @ApiPropertyOptional({ enum: SensitivityLevel, example: SensitivityLevel.HIGH })
  @IsEnum(SensitivityLevel)
  @IsOptional()
  interaction_sensitivity?: SensitivityLevel;

  @ApiPropertyOptional({
    type: [String],
    example: ['Customers stay in store for long periods'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowed_behaviors?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Warehouse entry', 'Emergency door access'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  forbidden_behaviors?: string[];
}