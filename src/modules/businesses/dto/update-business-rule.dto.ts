import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBusinessRuleDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  business_id?: number;

  @IsString()
  @IsOptional()
  rule_description?: string;
}
