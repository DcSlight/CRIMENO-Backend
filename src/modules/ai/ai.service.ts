import { Injectable } from '@nestjs/common';
import { KEYWORD_REPLIES, MOCK_REPLIES } from './ai.mock';

export type AskAiResponse = { answer: string };

// Replace this mock logic with a real LLM call once the AI backend is wired up.
@Injectable()
export class AiService {
  private replyIndex = 0;

  ask(question: string): AskAiResponse {
    const normalized = question.toLowerCase();

    const match = KEYWORD_REPLIES.find(({ keywords }) =>
      keywords.some((keyword) => normalized.includes(keyword)),
    );

    if (match) {
      return { answer: match.answer };
    }

    const answer = MOCK_REPLIES[this.replyIndex % MOCK_REPLIES.length];
    this.replyIndex += 1;

    return { answer };
  }
}
