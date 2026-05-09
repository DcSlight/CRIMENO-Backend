import { Module } from '@nestjs/common';
import { GroqGateway } from './groq.gateway';
import { GroqContextService } from './groq-context.service';

@Module({
  providers: [GroqGateway, GroqContextService],
  exports: [GroqGateway, GroqContextService],
})
export class GroqModule {}
