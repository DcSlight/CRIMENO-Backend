import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import configuration from './common/config/configuration';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HealthModule,
    PromptsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
