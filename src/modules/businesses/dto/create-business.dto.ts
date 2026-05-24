import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  store_name!: string;

  @IsString()
  @IsNotEmpty()
  store_type!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;
}
