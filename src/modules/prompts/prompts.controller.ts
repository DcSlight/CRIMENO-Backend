import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { PromptsService } from './prompts.service';

@ApiTags('prompts')
@Controller('prompts')
export class PromptsController {
  constructor(private readonly prompts: PromptsService) {}

  @Post()
  create(@Body() dto: CreatePromptDto) {
    return this.prompts.create(dto);
  }

  @Get()
  list() {
    return this.prompts.list();
  }
}
