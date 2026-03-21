import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCameraDto {
  @IsInt()
  @Min(1)
  business_id!: number;

  @IsString()
  @IsNotEmpty()
  camera_name!: string;

  @IsString()
  @IsNotEmpty()
  location_description!: string;
}
