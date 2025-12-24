import { Injectable } from '@nestjs/common';
import { CreatePromptDto } from './dto/create-prompt.dto';

type PromptItem = CreatePromptDto & { id: string; createdAt: string };

@Injectable()
export class PromptsService {
  private readonly items: PromptItem[] = [];

  create(dto: CreatePromptDto): PromptItem {
    const item: PromptItem = {
      ...dto,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.items.push(item);
    return item;
  }

  list(): PromptItem[] {
    return this.items;
  }
}
