import { IsNotEmpty, IsString } from "class-validator";

export class VideoSelectionDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  src!: string;
}