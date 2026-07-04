import { Injectable } from '@nestjs/common';
import {
  BUSINESS_KEYS,
  BUSINESS_LABELS,
  BusinessKey,
  KEYWORD_REPLIES,
  MOCK_REPLIES,
} from './ai.mock';

export type BusinessOption = { key: BusinessKey; label: string };

export type AskAiResponse =
  | { type: 'text'; answer: string }
  | { type: 'business_prompt'; answer: string; businesses: BusinessOption[] };

const BUSINESS_OPTIONS: BusinessOption[] = BUSINESS_KEYS.map((key) => ({
  key,
  label: BUSINESS_LABELS[key],
}));

function matchBusiness(question: string): BusinessKey | undefined {
  const normalized = question.trim().toLowerCase();

  const byNumber = BUSINESS_KEYS[Number(normalized) - 1];
  if (byNumber) return byNumber;

  return BUSINESS_KEYS.find((key) => {
    const label = BUSINESS_LABELS[key].toLowerCase();
    return normalized.includes(label) || normalized.includes(key.replace('_', ' '));
  });
}

// Replace this mock logic with a real LLM call once the AI backend is wired up.
@Injectable()
export class AiService {
  private replyIndex = 0;
  private pendingCategoryIndex: number | null = null;

  ask(question: string): AskAiResponse {
    if (this.pendingCategoryIndex !== null) {
      const business = matchBusiness(question);

      if (business) {
        const category = KEYWORD_REPLIES[this.pendingCategoryIndex];
        this.pendingCategoryIndex = null;
        return { type: 'text', answer: category.answers[business] };
      }

      // Unrecognized reply to a pending prompt — drop it and fall through
      // to treat this message as a fresh question.
      this.pendingCategoryIndex = null;
    }

    const normalized = question.toLowerCase();
    const categoryIndex = KEYWORD_REPLIES.findIndex(({ keywords }) =>
      keywords.some((keyword) => normalized.includes(keyword)),
    );

    if (categoryIndex !== -1) {
      this.pendingCategoryIndex = categoryIndex;
      return {
        type: 'business_prompt',
        answer: 'Which business would you like me to check?',
        businesses: BUSINESS_OPTIONS,
      };
    }

    const answer = MOCK_REPLIES[this.replyIndex % MOCK_REPLIES.length];
    this.replyIndex += 1;

    return { type: 'text', answer };
  }
}
