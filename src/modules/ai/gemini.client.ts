import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export type GeminiFailure =
  | 'not_configured'
  | 'dry_run'
  | 'timeout'
  | 'rate_limited'
  | 'provider_error'
  | 'blocked'
  | 'empty';

export type GeminiResult =
  | { ok: true; text: string }
  | { ok: false; reason: GeminiFailure; detail?: string };

// Only the fields we actually read from the generateContent response.
interface GenerateContentResponse {
  promptFeedback?: { blockReason?: string };
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string }[] };
  }[];
}

// Thin wrapper over the Gemini generateContent REST API using native fetch —
// there is no @google/genai (or any LLM) SDK in package.json, and Node's
// built-in fetch is enough for a single-shot, non-streaming request. Never
// throws: every failure mode collapses into a GeminiResult so callers can
// always produce a 200 response with a degraded answer instead of a 500.
@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string {
    return this.config.get<string>('gemini.apiKey') ?? '';
  }

  get model(): string {
    return (
      this.config.get<string>('gemini.model') ?? 'gemini-flash-lite-latest'
    );
  }

  private get timeoutMs(): number {
    return this.config.get<number>('gemini.timeoutMs') ?? 20_000;
  }

  private get maxOutputTokens(): number {
    return this.config.get<number>('gemini.maxOutputTokens') ?? 400;
  }

  private get sendPrompt(): boolean {
    return this.config.get<boolean>('gemini.sendPrompt') ?? true;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async generate(system: string, user: string): Promise<GeminiResult> {
    if (!this.isConfigured()) {
      return { ok: false, reason: 'not_configured' };
    }

    if (!this.sendPrompt) {
      this.logger.log(
        'SEND_PROMPT=false — skipping the real Gemini API call (dry run). See the prompt logged by AiService above.',
      );
      return { ok: false, reason: 'dry_run' };
    }

    const url = `${API_BASE}/${this.model}:generateContent`;
    const body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: this.maxOutputTokens,
      },
    };

    // Real, billable call to the Gemini API — logged explicitly so it's
    // obvious from the console exactly when a request (and quota) is spent.
    this.logger.log(`Sending request to Gemini (${this.model})...`);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      const error = err as Error;
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        return { ok: false, reason: 'timeout' };
      }
      return { ok: false, reason: 'provider_error', detail: error.message };
    }

    if (!response.ok) {
      if (response.status === 429) {
        return { ok: false, reason: 'rate_limited' };
      }
      const bodyText = await response.text().catch(() => '');
      this.logger.warn(
        `Gemini HTTP ${response.status}: ${bodyText.slice(0, 300)}`,
      );
      return {
        ok: false,
        reason: 'provider_error',
        detail: `HTTP ${response.status}`,
      };
    }

    let json: GenerateContentResponse;
    try {
      json = (await response.json()) as GenerateContentResponse;
    } catch (err) {
      return {
        ok: false,
        reason: 'provider_error',
        detail: (err as Error).message,
      };
    }

    if (json.promptFeedback?.blockReason) {
      return {
        ok: false,
        reason: 'blocked',
        detail: json.promptFeedback.blockReason,
      };
    }

    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .map((p) => p.text ?? '')
      .filter(Boolean)
      .join('');

    if (!text) {
      return {
        ok: false,
        reason: 'empty',
        detail: json.candidates?.[0]?.finishReason,
      };
    }

    return { ok: true, text };
  }
}
