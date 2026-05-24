import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCameraDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  business_id?: number;

  @IsString()
  @IsOptional()
  camera_name?: string;

  @IsString()
  @IsOptional()
  location_description?: string;
}
