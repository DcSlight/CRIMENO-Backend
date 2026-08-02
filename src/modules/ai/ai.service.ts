import { Injectable, Logger } from '@nestjs/common';
import { Business } from '../../database/entities';
import { formatBusinessContext } from '../businesses/business-context.util';
import { BusinessesService } from '../businesses/businesses.service';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  ActiveSelection,
  ActiveSelectionStore,
} from '../selection/active-selection.store';
import { buildPrompt } from './ai.prompt';
import {
  businessToAnalyticsKey,
  matchBusinessFromReply,
  videoToAnalyticsKey,
  videoToLogDir,
} from './business-key.util';
import { AskAiResponseDto } from './dto/ask-ai-response.dto';
import { GeminiClient, GeminiFailure } from './gemini.client';
import { ModelLogsService } from './model-logs.service';

export type BusinessOption = { key: string; label: string };

export type AskAiBusinessPromptResult = {
  type: 'business_prompt';
  answer: string;
  businesses: BusinessOption[];
};

export type AskAiResult = AskAiResponseDto | AskAiBusinessPromptResult;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // Holds the ORIGINAL question when the last reply was "which business
  // would you like me to check?" — the next message is expected to name a
  // business, but the question actually answered is this one, not the reply
  // itself (otherwise picking "Rio" would make "Rio" the question sent to
  // Gemini instead of whatever was actually asked). Deliberately process-wide,
  // single-slot state (no conversation id exists to key it by): fine for
  // this app's single-operator dashboard, same assumption ActiveSelectionStore
  // already makes.
  private pendingQuestion: string | null = null;

  constructor(
    private readonly gemini: GeminiClient,
    private readonly businessesService: BusinessesService,
    private readonly analyticsService: AnalyticsService,
    private readonly modelLogs: ModelLogsService,
    private readonly activeSelection: ActiveSelectionStore,
  ) {}

  async ask(question: string): Promise<AskAiResult> {
    const selection = this.activeSelection.get();
    if (selection) {
      // A video is already selected, so the business is unambiguous —
      // never interrupt with a picker in this case.
      return this.answerForSelection(question, selection);
    }

    if (this.pendingQuestion !== null) {
      const originalQuestion = this.pendingQuestion;
      this.pendingQuestion = null;
      const businesses = await this.businessesService.findAllBusinesses();
      const matched = matchBusinessFromReply(question, businesses);
      if (matched) {
        return this.answerForBusinessOnly(originalQuestion, matched);
      }
      // Unrecognized reply — drop it and fall through to treat this
      // message as a fresh question (which will re-prompt below).
    }

    return this.promptForBusiness(question);
  }

  // No video selected — ask which business the question is about instead of
  // guessing. Purely local: no Gemini call, so it's instant.
  private async promptForBusiness(question: string): Promise<AskAiResult> {
    const businesses = await this.businessesService.findAllBusinesses();
    if (businesses.length === 0) {
      return {
        type: 'text',
        answer:
          'No businesses are configured yet — add one from the dashboard first.',
      };
    }

    this.pendingQuestion = question;
    return {
      type: 'business_prompt',
      answer: 'Which business would you like me to check?',
      businesses: businesses.map((b) => ({
        key: String(b.id),
        label: b.store_name,
      })),
    };
  }

  // A business was picked from the prompt but no video is selected — ground
  // the answer in just that business's DB record and analytics KPIs.
  private async answerForBusinessOnly(
    question: string,
    business: Business,
  ): Promise<AskAiResponseDto> {
    const businessSection = formatBusinessContext(business);
    const knownKeys = this.analyticsService.getBusinesses().map((b) => b.key);
    const analyticsKey = businessToAnalyticsKey(business, knownKeys);
    const kpisSection = analyticsKey
      ? this.formatKpisSection(analyticsKey)
      : undefined;

    const { system, user } = buildPrompt({
      businessSection,
      kpisSection,
      groq: [],
      vlm: [],
      question,
      now: Date.now(),
    });

    return this.generate(system, user, business.id, 0, 0);
  }

  // A video is currently selected — ground the answer in that one business's
  // DB record, its analytics KPIs (if the key resolves), and the real
  // pipeline logs for that video.
  private async answerForSelection(
    question: string,
    selection: ActiveSelection,
  ): Promise<AskAiResponseDto> {
    const business = await this.businessesService.findBusinessById(
      selection.businessId,
    );
    const businessSection = formatBusinessContext(business);

    const knownKeys = this.analyticsService.getBusinesses().map((b) => b.key);
    const analyticsKey = videoToAnalyticsKey(selection.src, knownKeys);
    const kpisSection = analyticsKey
      ? this.formatKpisSection(analyticsKey)
      : undefined;

    const logDir = videoToLogDir(selection.src);
    const groq = this.modelLogs.readGroq(logDir);
    const vlm = this.modelLogs.readVlm(logDir);

    const { system, user } = buildPrompt({
      businessSection,
      kpisSection,
      groq,
      vlm,
      question,
      now: Date.now(),
    });

    return this.generate(
      system,
      user,
      selection.businessId,
      groq.length,
      vlm.length,
    );
  }

  private formatKpisSection(analyticsKey: string): string | undefined {
    const kpis = this.analyticsService.getKpis(analyticsKey);
    if (!kpis) return undefined;

    const lines = [
      `Total events: ${kpis.totalEvents}`,
      `Criminal events: ${kpis.criminalEvents}`,
      `Average anomaly score: ${kpis.avgAnomalyScore}`,
      `Alerts today: ${kpis.alertsToday}`,
    ];

    const types = this.analyticsService.getAnomalyType(analyticsKey);
    if (types?.length) {
      lines.push(
        `Top anomaly types: ${types.map((t) => `${t.type} (${t.count})`).join(', ')}`,
      );
    }

    const severity =
      this.analyticsService.getSeverityDistribution(analyticsKey);
    if (severity?.length) {
      lines.push(
        `Severity split: ${severity.map((s) => `${s.name} ${s.value}`).join(', ')}`,
      );
    }

    return lines.join('\n');
  }

  private async generate(
    system: string,
    user: string,
    businessId: number | null,
    groqEvents: number,
    vlmEvents: number,
  ): Promise<AskAiResponseDto> {
    this.logger.debug(
      `--- Gemini prompt (businessId=${businessId ?? 'none'}) ---\n[SYSTEM]\n${system}\n\n[USER]\n${user}\n--- end prompt ---`,
    );

    const result = await this.gemini.generate(system, user);
    const meta = {
      model: this.gemini.model,
      businessId,
      groqEvents,
      vlmEvents,
    };

    if (result.ok) {
      return { type: 'text', answer: result.text, meta };
    }

    return {
      type: 'text',
      answer: this.fallbackAnswer(result.reason),
      meta: { ...meta, degraded: result.reason },
    };
  }

  private fallbackAnswer(reason: GeminiFailure): string {
    switch (reason) {
      case 'not_configured':
        return "The AI assistant isn't configured yet — ask an admin to set GEMINI_API_KEY.";
      case 'dry_run':
        return 'SEND_PROMPT=false — no request was sent to Gemini. Check the server logs for the prompt that would have been sent.';
      case 'timeout':
        return 'The AI assistant took too long to respond. Please try again.';
      case 'rate_limited':
        return 'The AI assistant is receiving too many requests right now. Please try again shortly.';
      case 'blocked':
        return "I can't answer that question as asked — try rephrasing it.";
      case 'empty':
      case 'provider_error':
      default:
        return "I couldn't generate an answer just now. Please try again.";
    }
  }
}
