import { Module } from '@nestjs/common';
import { GroqGateway } from './groq.gateway';
import { GroqContextService } from './groq-context.service';
import { GroqController } from './groq.controller';

@Module({
  controllers: [GroqController],
  providers: [GroqGateway, GroqContextService],
  exports: [GroqGateway, GroqContextService],
})
export class GroqModule {}
