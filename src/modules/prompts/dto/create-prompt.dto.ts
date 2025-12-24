import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePromptDto {
  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(0)
  frameIndex!: number;

  @ApiProperty({ example: 'Person appears to be running...' })
  @IsString()
  text!: string;

  @ApiProperty({ required: false, example: 'shop.mp4' })
  @IsOptional()
  @IsString()
  source?: string;
}
