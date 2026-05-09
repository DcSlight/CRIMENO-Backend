import { Module } from '@nestjs/common';
import { TrackerGateway } from './tracker.gateway';

@Module({
  providers: [TrackerGateway],
  exports: [TrackerGateway],
})
export class TrackerModule {}
