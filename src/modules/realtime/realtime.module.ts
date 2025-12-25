import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { ZmqIngestService } from './zmq-ingest.service';
import { FrameStoreService } from './frame-store.service';

@Module({
  providers: [RealtimeGateway, ZmqIngestService, FrameStoreService],
})
export class RealtimeModule {}
