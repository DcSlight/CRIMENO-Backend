import { Module } from '@nestjs/common';
import { StreamGateway } from './stream.gateway';
import { ZmqIngestService } from './zmq-ingest.service';


@Module({
  providers: [StreamGateway, ZmqIngestService],
})
export class StreamModule {}
