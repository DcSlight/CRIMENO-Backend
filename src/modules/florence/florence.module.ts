import { Module } from '@nestjs/common';
import { FlorenceGateway } from './florence.gateway';

@Module({
  providers: [FlorenceGateway],
  exports: [FlorenceGateway],
})
export class FlorenceModule {}
