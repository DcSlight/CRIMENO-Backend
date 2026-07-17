import { Module } from '@nestjs/common';
import { VlmGateway } from './vlm.gateway';

@Module({
  providers: [VlmGateway],
  exports: [VlmGateway],
})
export class VlmModule {}
