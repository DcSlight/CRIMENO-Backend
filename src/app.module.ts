import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { FlorenceModule } from './modules/florence/florence.module';
import configuration from './common/config/configuration';
import { TrackerModule } from './modules/tracker/tracker.module';
import { QwenModule } from './modules/qwen/qwen.module';
import { VideosModule } from './modules/videos/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HealthModule,
    FlorenceModule,
    TrackerModule,
    QwenModule,
    VideosModule,
  ],
})
export class AppModule {}
