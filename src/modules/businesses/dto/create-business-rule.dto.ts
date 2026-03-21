import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateBusinessRuleDto {
  @IsInt()
  @Min(1)
  business_id!: number;

  @IsString()
  @IsNotEmpty()
  rule_description!: string;
}
