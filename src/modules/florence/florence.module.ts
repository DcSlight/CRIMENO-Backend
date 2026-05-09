import { Module } from '@nestjs/common';
import { FlorenceGateway } from './florence.gateway';
import { BroadcasterModule } from '../broadcaster/barodcaster.module';

@Module({
  imports: [BroadcasterModule],
  providers: [FlorenceGateway],
  exports: [FlorenceGateway],
})
export class FlorenceModule {}
