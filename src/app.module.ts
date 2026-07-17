import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { VlmModule } from './modules/vlm/vlm.module';
import configuration from './common/config/configuration';
import { TrackerModule } from './modules/tracker/tracker.module';
import { GroqModule } from './modules/groq/groq.module';
import { VideosModule } from './modules/videos/videos.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import {
  databaseConfig,
  getTypeOrmConfig,
} from './common/config/database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: getTypeOrmConfig,
    }),
    HealthModule,
    VlmModule,
    TrackerModule,
    GroqModule,
    VideosModule,
    BusinessesModule,
    AnalyticsModule,
    AiModule,
  ],
})
export class AppModule {}
