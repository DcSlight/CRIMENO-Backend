import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GroqGateway } from '../groq/groq.gateway';
import { FlorenceGateway } from '../florence/florence.gateway';

const MOCK_FPS = 30;

function parseJsonl<T>(filePath: string): T[] {
  const text = fs.readFileSync(filePath, 'utf-8');
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as T);
}

type GroqEntry = {
  type: string;
  frame_range?: { start?: number };
};

type VlmEntry = {
  type: string;
  video_time_ms?: number;
};

@Injectable()
export class DemoReplayService implements OnModuleDestroy {
  private timers: ReturnType<typeof setTimeout>[] = [];

  private groqEntries: GroqEntry[] = [];
  private vlmEntries: VlmEntry[] = [];
  private loaded = false;

  constructor(
    private readonly groqGateway: GroqGateway,
    private readonly florenceGateway: FlorenceGateway,
  ) {}

  private load() {
    if (this.loaded) return;

    const mocksDir = path.join(process.cwd(), 'mocks');
    this.groqEntries = parseJsonl<GroqEntry>(path.join(mocksDir, 'groq_mock.jsonl'));
    this.vlmEntries = parseJsonl<VlmEntry>(path.join(mocksDir, 'vlm_mock.jsonl'));
    this.loaded = true;
  }

  stop() {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
  }

  start() {
    this.stop();
    this.load();

    for (const entry of this.groqEntries) {
      const startFrame = entry.frame_range?.start ?? 0;
      const delayMs = startFrame * (1000 / MOCK_FPS);
      const t = setTimeout(() => {
        this.groqGateway.broadcast(entry);
      }, delayMs);
      this.timers.push(t);
    }

    for (const entry of this.vlmEntries) {
      const delayMs = entry.video_time_ms ?? 0;
      const t = setTimeout(() => {
        this.florenceGateway.broadcast(entry);
      }, delayMs);
      this.timers.push(t);
    }
  }

  onModuleDestroy() {
    this.stop();
  }
}
