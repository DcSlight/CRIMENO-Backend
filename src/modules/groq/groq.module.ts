import { Module } from '@nestjs/common';
import { GroqGateway } from './groq.gateway';
import { GroqContextService } from './groq-context.service';
import { BroadcasterModule } from '../broadcaster/barodcaster.module';

@Module({
  imports: [BroadcasterModule],
  providers: [GroqGateway, GroqContextService],
  exports: [GroqGateway, GroqContextService],
})
export class GroqModule {}
