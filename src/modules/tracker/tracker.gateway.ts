import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { BroadcasterService } from '../broadcaster/broadcaster.service';

type AnyJson = Record<string, any>;

@WebSocketGateway({
  path: '/ws/tracker',
  cors: { origin: true, credentials: true },
})
export class TrackerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TrackerGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly broadcaster: BroadcasterService) {}

  handleConnection(client: WebSocket) {
    this.logger.log('✅ client connected');
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log('❌ client disconnected');
  }

  private getTrackColor(source: unknown): string {
    const normalized = typeof source === 'string' ? source.toLowerCase() : '';

    switch (normalized) {
      case 'suspicious':
        return 'red';
      case 'objects':
        return 'green';
      default:
        return 'green';
    }
  }

  private buildOutboundMessage(msg: string, payload: AnyJson | null): string {
    if (payload?.type !== 'tracker_frame' || !Array.isArray(payload.tracks)) {
      return msg;
    }

    try {
      const tracks = payload.tracks.map((track: AnyJson) => ({
        ...track,
        bbox_color: this.getTrackColor(track?.source),
      }));

      return JSON.stringify({
        ...payload,
        tracks,
      });
    } catch {
      return msg;
    }
  }

  afterInit(server: Server) {
    server.on('connection', (ws: WebSocket) => {
      ws.on('message', (raw) => {
        const msg = raw.toString();
        this.logger.log(`📦 got message: ${msg.slice(0, 180)}`);

        let payload: AnyJson | null = null;
        try {
          payload = JSON.parse(msg);
        } catch {
          // ignore non-json
        }

        if (payload?.type === 'tracker_frame') {
          const frame = payload.frame_index;
          const t = payload.video_time_ms;
          const tracks = Array.isArray(payload.tracks) ? payload.tracks.length : 0;
          const motion = payload.motion_detected ? 'yes' : 'no';
          this.logger.log(
            `⚡ tracker frame=${frame} t=${t}ms tracks=${tracks} motion=${motion}`,
          );
        }

        if (!this.broadcaster.isReady()) {
          this.logger.warn('[GATE] Dropping stale tracker message during reset window');
          return;
        }

        const outboundMessage = this.buildOutboundMessage(msg, payload);

        for (const client of server.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(outboundMessage);
          }
        }
      });
    });
  }
}
