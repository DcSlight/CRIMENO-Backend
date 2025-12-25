import { Injectable, OnModuleInit } from '@nestjs/common';
import { Subscriber } from 'zeromq';
import { StreamGateway } from './stream.gateway';

function toIntSafe(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

@Injectable()
export class ZmqIngestService implements OnModuleInit {
  constructor(private readonly gateway: StreamGateway) {}

  async onModuleInit() {
    // Run all subscribers in parallel (no await that blocks forever)
    void this.startFramesSub();
    void this.startTrackerSub();
    void this.startFlorenceSub();
  }

  private async startFramesSub() {
    const sub = new Subscriber();
    sub.connect('tcp://127.0.0.1:5560');
    sub.subscribe('frame');

    // eslint-disable-next-line no-console
    console.log('[ZMQ] SUB frames connected tcp://127.0.0.1:5560 topic=frame');

    let count = 0;
    for await (const msg of sub) {
      // [topic, frame_idx, video_time_ms, jpg_bytes]
      const frameIdx = toIntSafe(msg[1]?.toString());
      const videoTimeMs = toIntSafe(msg[2]?.toString());
      const jpgBytes = msg[3];

      // For simplicity: base64 to React
      const jpegBase64 = jpgBytes.toString('base64');

      this.gateway.emitFrame({
        frame_index: frameIdx,
        video_time_ms: videoTimeMs,
        jpeg_base64: jpegBase64,
      });

      count += 1;
      if (count % 30 === 0) {
        // eslint-disable-next-line no-console
        console.log(`[ZMQ] frames received=${count} last_frame=${frameIdx} t_ms=${videoTimeMs}`);
      }
    }
  }

  private async startTrackerSub() {
    const sub = new Subscriber();
    sub.connect('tcp://127.0.0.1:5571');
    sub.subscribe('tracker');

    // eslint-disable-next-line no-console
    console.log('[ZMQ] SUB tracker connected tcp://127.0.0.1:5571 topic=tracker');

    let count = 0;
    for await (const msg of sub) {
      const jsonStr = msg[1]?.toString() ?? '{}';
      const payload = JSON.parse(jsonStr);

      this.gateway.emitTracker(payload);

      count += 1;
      if (count % 20 === 0) {
        // eslint-disable-next-line no-console
        console.log(`[ZMQ] tracker received=${count} frame=${payload?.frame_index} dets=${payload?.detections?.length ?? 0}`);
      }
    }
  }

  private async startFlorenceSub() {
    const sub = new Subscriber();
    sub.connect('tcp://127.0.0.1:5572');
    sub.subscribe('florence');

    // eslint-disable-next-line no-console
    console.log('[ZMQ] SUB florence connected tcp://127.0.0.1:5572 topic=florence');

    let count = 0;
    for await (const msg of sub) {
      const jsonStr = msg[1]?.toString() ?? '{}';
      const payload = JSON.parse(jsonStr);

      this.gateway.emitFlorence(payload);

      count += 1;
      if (count % 10 === 0) {
        // eslint-disable-next-line no-console
        console.log(`[ZMQ] florence received=${count} frame=${payload?.frame_index} text_len=${(payload?.caption ?? '').length}`);
      }
    }
  }
}
