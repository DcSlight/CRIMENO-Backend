import { Module } from '@nestjs/common';
import { TrackerGateway } from './tracker.gateway';
import { BroadcasterModule } from '../broadcaster/barodcaster.module';

@Module({
  imports: [BroadcasterModule],
  providers: [TrackerGateway],
  exports: [TrackerGateway],
})
export class TrackerModule {}
