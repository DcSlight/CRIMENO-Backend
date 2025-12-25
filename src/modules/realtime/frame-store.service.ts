import { Injectable } from '@nestjs/common';

export type TrackerPayload = {
  type: 'tracker';
  ts_unix_ms: number;
  frame_id: number;
  video_time_ms: number;
  frame_width?: number;
  frame_height?: number;
  detections: Array<{
    id: number | null;
    cls: string;
    cls_id: number;
    conf: number;
    bbox_xyxy: [number, number, number, number];
  }>;
};

export type FlorencePayload = {
  type: 'florence';
  ts_unix_ms: number;
  frame_id: number;
  video_time_ms: number;
  frame_width?: number;
  frame_height?: number;
  caption: string;
  raw: unknown;
};

export type FrameMessage = {
  frame_id: number;
  video_time_ms: number;
  width: number;
  height: number;
  jpg_base64: string;
  ts_unix_ms: number;
};

type FrameState = {
  frame?: FrameMessage;
  tracker?: TrackerPayload;
  florence?: FlorencePayload;
  lastUpdateMs: number;
};

@Injectable()
export class FrameStoreService {
  private readonly map = new Map<number, FrameState>();

  upsertFrame(frame: FrameMessage) {
    const s = this.map.get(frame.frame_id) ?? { lastUpdateMs: 0 };
    s.frame = frame;
    s.lastUpdateMs = Date.now();
    this.map.set(frame.frame_id, s);
    this.gc();
    return s;
  }

  upsertTracker(p: TrackerPayload) {
    const s = this.map.get(p.frame_id) ?? { lastUpdateMs: 0 };
    s.tracker = p;
    s.lastUpdateMs = Date.now();
    this.map.set(p.frame_id, s);
    this.gc();
    return s;
  }

  upsertFlorence(p: FlorencePayload) {
    const s = this.map.get(p.frame_id) ?? { lastUpdateMs: 0 };
    s.florence = p;
    s.lastUpdateMs = Date.now();
    this.map.set(p.frame_id, s);
    this.gc();
    return s;
  }

  toClientPayload(frameId: number) {
    const s = this.map.get(frameId);
    if (!s) return null;
    return {
      frame: s.frame ?? null,
      tracker: s.tracker ?? null,
      florence: s.florence ?? null,
    };
  }

  private gc() {
    // keep last ~500 frames or 30 seconds (whichever is stricter)
    const now = Date.now();
    const ttlMs = 30_000;

    for (const [k, v] of this.map.entries()) {
      if (now - v.lastUpdateMs > ttlMs) this.map.delete(k);
    }

    if (this.map.size > 500) {
      // delete oldest
      const entries = [...this.map.entries()].sort((a, b) => a[1].lastUpdateMs - b[1].lastUpdateMs);
      const toDelete = entries.slice(0, this.map.size - 500);
      for (const [k] of toDelete) this.map.delete(k);
    }
  }
}
