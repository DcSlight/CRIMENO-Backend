import { Module } from '@nestjs/common';
import { GroqModule } from '../groq/groq.module';
import { FlorenceModule } from '../florence/florence.module';
import { DemoReplayService } from './demo-replay.service';
import { DemoInterceptor } from './demo.interceptor';

@Module({
  imports: [GroqModule, FlorenceModule],
  providers: [DemoReplayService, DemoInterceptor],
  exports: [DemoReplayService, DemoInterceptor],
})
export class DemoModule {}
