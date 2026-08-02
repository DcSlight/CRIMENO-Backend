import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { GeminiFailure } from '../gemini.client';

export class AskAiResponseMetaDto {
  @ApiProperty({ example: 'gemini-flash-lite-latest' })
  model!: string;

  @ApiProperty({ example: 6, nullable: true })
  businessId!: number | null;

  @ApiProperty({ example: 12 })
  groqEvents!: number;

  @ApiProperty({ example: 8 })
  vlmEvents!: number;

  @ApiPropertyOptional({
    example: 'timeout',
    description:
      'Set when the answer is a degraded fallback rather than a real Gemini response',
  })
  degraded?: GeminiFailure;
}

export class AskAiResponseDto {
  @ApiProperty({ example: 'text', enum: ['text'] })
  type!: 'text';

  @ApiProperty({
    example: 'The gun store feed has no criminal events recorded today.',
  })
  answer!: string;

  @ApiPropertyOptional({ type: AskAiResponseMetaDto })
  meta?: AskAiResponseMetaDto;
}
