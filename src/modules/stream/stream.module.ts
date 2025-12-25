import { Module } from '@nestjs/common';
import { StreamGateway } from './stream.gateway';

@Module({
  providers: [StreamGateway],
  exports: [StreamGateway],
})
export class StreamModule {}
