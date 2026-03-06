import { Module } from '@nestjs/common';
import { QwenGateway } from './qwen.gateway';

@Module({
  providers: [QwenGateway],
  exports: [QwenGateway],
})
export class QwenModule {}
