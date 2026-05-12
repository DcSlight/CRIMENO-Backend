import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GroqGateway } from './groq.gateway';

class GroqFrameRangeDto {
  @IsOptional()
  @IsNumber()
  start: number | null = null;

  @IsOptional()
  @IsNumber()
  end: number | null = null;
}

class GroqResultDto {
  @IsString()
  @IsIn(['normal', 'suspicious', 'criminal'])
  label: 'normal' | 'suspicious' | 'criminal' = 'criminal';

  @IsOptional()
  @IsNumber()
  anomaly_score: number | null = null;

  @IsString()
  reason: string = '';

  @IsArray()
  @IsString({ each: true })
  key_moments: string[] = [];
}

class GroqTestBroadcastDto {
  @IsString()
  @IsIn(['groq_anomaly'])
  type: 'groq_anomaly' = 'groq_anomaly';

  @ValidateNested()
  @Type(() => GroqFrameRangeDto)
  frame_range: GroqFrameRangeDto = { start: null, end: null };

  @ValidateNested()
  @Type(() => GroqResultDto)
  result!: GroqResultDto;
}

@ApiTags('groq')
@Controller('groq')
export class GroqController {
  constructor(private readonly gateway: GroqGateway) {}

  @Post('test-broadcast')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Broadcast a test Groq anomaly to all WebSocket clients',
    description:
      'Injects a payload into /ws/groq, bypassing the Python worker. ' +
      'Use this to test the mobile app and React dashboard without the full pipeline.',
  })
  @ApiBody({
    type: GroqTestBroadcastDto,
    examples: {
      criminal: {
        summary: 'Criminal — HIGH (red card + push notification)',
        value: {
          type: 'groq_anomaly',
          frame_range: { start: 81, end: 106 },
          result: {
            label: 'criminal',
            anomaly_score: 0.9,
            reason: 'Robbery in progress',
            key_moments: [
              'man holding gun',
              'woman looking concerned',
              'standing in front of cash register',
              'engaged in conversation during robbery',
            ],
          },
        },
      },
      suspicious: {
        summary: 'Suspicious — MEDIUM (orange card + push notification)',
        value: {
          type: 'groq_anomaly',
          frame_range: { start: 12, end: 35 },
          result: {
            label: 'suspicious',
            anomaly_score: 0.55,
            reason: 'Unidentified individual loitering near entrance for over 10 minutes.',
            key_moments: ['pacing back and forth', 'checking phone repeatedly'],
          },
        },
      },
      normal: {
        summary: 'Normal — SAFE (green card, no notification)',
        value: {
          type: 'groq_anomaly',
          frame_range: { start: 1, end: 20 },
          result: {
            label: 'normal',
            anomaly_score: 0.05,
            reason: 'No anomalous behavior detected.',
            key_moments: [],
          },
        },
      },
    },
  })
  testBroadcast(@Body() dto: GroqTestBroadcastDto): { broadcasted: boolean; clientCount: number } {
    const clientCount = this.gateway.server
      ? [...this.gateway.server.clients].filter((c: any) => c.readyState === 1).length
      : 0;

    this.gateway.broadcast(dto);

    return { broadcasted: true, clientCount };
  }
}
