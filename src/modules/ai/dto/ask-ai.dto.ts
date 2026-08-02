import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AskAiDto {
  @ApiProperty({ example: 'Analyze behaviour patterns' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  question!: string;
}
