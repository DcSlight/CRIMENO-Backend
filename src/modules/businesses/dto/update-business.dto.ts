import { IsOptional, IsString } from 'class-validator';

export class UpdateBusinessDto {
  @IsString()
  @IsOptional()
  store_name?: string;

  @IsString()
  @IsOptional()
  store_type?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
