import { Module } from '@nestjs/common';
import { QwenGateway } from './qwen.gateway';
import { QwenContextService } from './qwen-context.service';

@Module({
  providers: [QwenGateway, QwenContextService],
  exports: [QwenGateway, QwenContextService],
})
export class QwenModule {}
