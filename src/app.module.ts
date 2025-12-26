import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import configuration from './common/config/configuration';
import { StreamModule } from './modules/stream/stream.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    HealthModule,
    PromptsModule,
    StreamModule,
  ],
})
export class AppModule {}
