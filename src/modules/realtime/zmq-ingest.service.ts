import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subscriber, Pull } from 'zeromq';
import { FrameStoreService, TrackerPayload, FlorencePayload } from './frame-store.service';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class ZmqIngestService implements OnModuleInit, OnModuleDestroy {
  private sub?: Subscriber;
  private pullTracker?: Pull;
  private pullFlorence?: Pull;
  private running = false;

  constructor(
    private readonly store: FrameStoreService,
    private readonly gw: RealtimeGateway,
  ) {}

  async onModuleInit() {
    this.running = true;

    // 1) SUB frames from broadcaster
    this.sub = new Subscriber();
    // broadcaster binds on 5560 => we connect
    this.sub.connect('tcp://127.0.0.1:5560');
    this.sub.subscribe('frame');

    // 2) PULL tracker results (python PUSH connect)
    this.pullTracker = new Pull();
    await this.pullTracker.bind('tcp://127.0.0.1:5571');

    // 3) PULL florence results
    this.pullFlorence = new Pull();
    await this.pullFlorence.bind('tcp://127.0.0.1:5572');

    this.loopFrames().catch(console.error);
    this.loopTracker().catch(console.error);
    this.loopFlorence().catch(console.error);

    // eslint-disable-next-line no-console
    console.log('[ZMQ] ingest started');
  }

  async onModuleDestroy() {
    this.running = false;
    this.sub?.close();
    this.pullTracker?.close();
    this.pullFlorence?.close();
  }

  private async loopFrames() {
    if (!this.sub) return;

    for await (const msg of this.sub) {
      if (!this.running) break;

      // msg is an array of frames (Buffers)
      // Expected multipart:
      // [topic, frame_id, video_time_ms, width, height, jpg]
      const parts = msg as Buffer[];
      if (parts.length < 4) continue;

      const topic = parts[0].toString();
      if (topic !== 'frame') continue;

      const frameId = Number(parts[1].toString());
      const videoTimeMs = Number(parts[2].toString());

      let width = 0;
      let height = 0;
      let jpg: Buffer;

      if (parts.length === 6) {
        width = Number(parts[3].toString());
        height = Number(parts[4].toString());
        jpg = parts[5];
      } else {
        // backward compat
        jpg = parts[3];
      }

      const frameMsg = {
        frame_id: frameId,
        video_time_ms: videoTimeMs,
        width,
        height,
        jpg_base64: jpg.toString('base64'),
        ts_unix_ms: Date.now(),
      };

      this.store.upsertFrame(frameMsg);

      // Send frame quickly (clients can draw immediately)
      this.gw.emitFrame(frameId, frameMsg);

      // Also send merged update (frame + latest tracker/florence if exists)
      const merged = this.store.toClientPayload(frameId);
      this.gw.emitUpdate(frameId, merged);
    }
  }

  private async loopTracker() {
    if (!this.pullTracker) return;

    for await (const msg of this.pullTracker) {
      if (!this.running) break;

      const parts = msg as Buffer[];
      if (parts.length < 2) continue;

      const topic = parts[0].toString();
      if (topic !== 'tracker') continue;

      const payload = JSON.parse(parts[1].toString()) as TrackerPayload;
      const s = this.store.upsertTracker(payload);

      const merged = this.store.toClientPayload(payload.frame_id);
      this.gw.emitUpdate(payload.frame_id, merged);

      // Optional: if no frame yet, still send update (React will apply when frame arrives)
      if (!s.frame) {
        this.gw.emitUpdate(payload.frame_id, merged);
      }
    }
  }

  private async loopFlorence() {
    if (!this.pullFlorence) return;

    for await (const msg of this.pullFlorence) {
      if (!this.running) break;

      const parts = msg as Buffer[];
      if (parts.length < 2) continue;

      const topic = parts[0].toString();
      if (topic !== 'florence') continue;

      const payload = JSON.parse(parts[1].toString()) as FlorencePayload;
      const s = this.store.upsertFlorence(payload);

      const merged = this.store.toClientPayload(payload.frame_id);
      this.gw.emitUpdate(payload.frame_id, merged);

      if (!s.frame) {
        this.gw.emitUpdate(payload.frame_id, merged);
      }
    }
  }
}
