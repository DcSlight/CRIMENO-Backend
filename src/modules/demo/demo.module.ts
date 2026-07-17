import { Module } from '@nestjs/common';
import { GroqModule } from '../groq/groq.module';
import { VlmModule } from '../vlm/vlm.module';
import { DemoReplayService } from './demo-replay.service';
import { DemoInterceptor } from './demo.interceptor';

@Module({
  imports: [GroqModule, VlmModule],
  providers: [DemoReplayService, DemoInterceptor],
  exports: [DemoReplayService, DemoInterceptor],
})
export class DemoModule {}
