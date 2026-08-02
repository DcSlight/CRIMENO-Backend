import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export type GroqLogEvent = {
  type: 'groq_anomaly';
  frame_range?: { start?: number; end?: number };
  result?: {
    label?: string;
    anomaly_score?: number;
    reason?: string;
    key_moments?: string[];
  };
};

export type VlmLogEvent = {
  type: 'vlm_frame';
  frame_index?: number;
  video_time_ms?: number;
  qa?: Record<string, string>;
  summary?: string;
};

const GROQ_LIMIT = 24;
const VLM_LIMIT = 8;

// Reads the real pipeline logs written by the CRIMENO-Model repo for a given
// video's session — <modelLogsDir>/<logDir>/{groq,vlm}/groq_v<N>.jsonl —
// on demand per request, since the pipeline appends to these while it runs.
// A session can accumulate multiple versions (re-runs); only the highest
// v<N> is read, never concatenated. Never throws: a missing/unreadable
// directory just yields no events, so a bad log dir degrades gracefully
// rather than breaking the chat.
@Injectable()
export class ModelLogsService {
  private readonly logger = new Logger(ModelLogsService.name);

  constructor(private readonly config: ConfigService) {}

  private get logsRoot(): string {
    return this.config.get<string>('modelLogsDir') ?? '../CRIMENO-Model/logs';
  }

  readGroq(logDir: string): GroqLogEvent[] {
    return this.readLatestVersion<GroqLogEvent>(logDir, 'groq').slice(
      -GROQ_LIMIT,
    );
  }

  readVlm(logDir: string): VlmLogEvent[] {
    return this.readLatestVersion<VlmLogEvent>(logDir, 'vlm').slice(-VLM_LIMIT);
  }

  private readLatestVersion<T>(logDir: string, kind: 'groq' | 'vlm'): T[] {
    const dir = path.join(this.logsRoot, logDir, kind);

    let files: string[];
    try {
      files = fs.readdirSync(dir);
    } catch {
      return [];
    }

    const versioned = files
      .map((name) => {
        const match = name.match(/_v(\d+)\.jsonl$/i);
        return match ? { name, version: Number(match[1]) } : null;
      })
      .filter((x): x is { name: string; version: number } => x !== null)
      .sort((a, b) => b.version - a.version);

    if (versioned.length === 0) {
      return [];
    }

    const latest = path.join(dir, versioned[0].name);

    let raw: string;
    try {
      raw = fs.readFileSync(latest, 'utf-8');
    } catch (err) {
      this.logger.warn(`Could not read ${latest}: ${(err as Error).message}`);
      return [];
    }

    const events: T[] = [];
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        events.push(JSON.parse(trimmed) as T);
      } catch {
        // Skip malformed lines rather than failing the whole read.
      }
    }
    return events;
  }
}
