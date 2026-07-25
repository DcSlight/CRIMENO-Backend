import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import type { AskAiResponse } from './ai.service';
import { AskAiDto } from './dto/ask-ai.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({
    summary: 'Ask the AI assistant a question and get a mock answer',
  })
  @ApiBody({ type: AskAiDto })
  @Post('chat')
  chat(@Body() dto: AskAiDto): AskAiResponse {
    return this.aiService.ask(dto.question);
  }
}
