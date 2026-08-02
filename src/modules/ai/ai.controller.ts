import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import type { AskAiResult } from './ai.service';
import { AskAiDto } from './dto/ask-ai.dto';
import { AskAiResponseDto } from './dto/ask-ai-response.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({
    summary:
      'Ask the AI assistant a question, grounded in real business/analytics/pipeline data. ' +
      'May reply asking which business to check first if none is currently selected.',
  })
  @ApiBody({ type: AskAiDto })
  @ApiOkResponse({ type: AskAiResponseDto })
  @Post('chat')
  async chat(@Body() dto: AskAiDto): Promise<AskAiResult> {
    return this.aiService.ask(dto.question);
  }
}
