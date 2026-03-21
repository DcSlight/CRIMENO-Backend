import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { FlorenceModule } from './modules/florence/florence.module';
import configuration from './common/config/configuration';
import { TrackerModule } from './modules/tracker/tracker.module';
import { QwenModule } from './modules/qwen/qwen.module';
import { VideosModule } from './modules/videos/videos.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
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
    FlorenceModule,
    TrackerModule,
    QwenModule,
    VideosModule,
    BusinessesModule,
  ],
})
export class AppModule {}
