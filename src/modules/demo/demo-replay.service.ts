import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GroqGateway } from '../groq/groq.gateway';
import { FlorenceGateway } from '../florence/florence.gateway';

const MOCK_FPS = 30;
const START_DELAY_MS = 1000;

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

type DemoDataset = {
  groqEntries: GroqEntry[];
  vlmEntries: VlmEntry[];
};

@Injectable()
export class DemoReplayService implements OnModuleDestroy {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private datasets = new Map<string, DemoDataset>();

  constructor(
    private readonly groqGateway: GroqGateway,
    private readonly florenceGateway: FlorenceGateway,
  ) {}

  private load(demoKey: string): DemoDataset {
    const cached = this.datasets.get(demoKey);
    if (cached) return cached;

    const datasetDir = path.join(process.cwd(), 'mocks', demoKey);
    const groqPath = path.join(datasetDir, 'groq_mock.jsonl');
    const vlmPath = path.join(datasetDir, 'vlm_mock.jsonl');

    if (!fs.existsSync(groqPath) || !fs.existsSync(vlmPath)) {
      throw new NotFoundException(
        `No demo dataset found for "${demoKey}" (expected mocks/${demoKey}/groq_mock.jsonl and vlm_mock.jsonl)`,
      );
    }

    const dataset: DemoDataset = {
      groqEntries: parseJsonl<GroqEntry>(groqPath),
      vlmEntries: parseJsonl<VlmEntry>(vlmPath),
    };
    this.datasets.set(demoKey, dataset);
    return dataset;
  }

  stop() {
    for (const t of this.timers) clearTimeout(t);
    this.timers = [];
  }

  start(demoKey: string) {
    // Stop whatever is currently playing first, so a request for an unknown
    // video (or any error below) never leaves the previous demo's timers
    // running and broadcasting stale frames.
    this.stop();

    const { groqEntries, vlmEntries } = this.load(demoKey);

    for (const entry of groqEntries) {
      const startFrame = entry.frame_range?.start ?? 0;
      const delayMs = START_DELAY_MS + startFrame * (1000 / MOCK_FPS);
      const t = setTimeout(() => {
        this.groqGateway.broadcast(entry);
      }, delayMs);
      this.timers.push(t);
    }

    for (const entry of vlmEntries) {
      const delayMs = START_DELAY_MS + (entry.video_time_ms ?? 0);
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
