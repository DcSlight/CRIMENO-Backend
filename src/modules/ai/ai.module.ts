import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { ActiveSelectionModule } from '../selection/active-selection.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiClient } from './gemini.client';
import { ModelLogsService } from './model-logs.service';

@Module({
  imports: [BusinessesModule, AnalyticsModule, ActiveSelectionModule],
  controllers: [AiController],
  providers: [AiService, GeminiClient, ModelLogsService],
})
export class AiModule {}
