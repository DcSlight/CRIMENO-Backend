import { Module } from '@nestjs/common';
import { GroqModule } from '../groq/groq.module';
import { VlmModule } from '../vlm/vlm.module';
import { ActiveSelectionModule } from '../selection/active-selection.module';
import { DemoReplayService } from './demo-replay.service';
import { DemoInterceptor } from './demo.interceptor';

@Module({
  imports: [GroqModule, VlmModule, ActiveSelectionModule],
  providers: [DemoReplayService, DemoInterceptor],
  exports: [DemoReplayService, DemoInterceptor],
})
export class DemoModule {}
