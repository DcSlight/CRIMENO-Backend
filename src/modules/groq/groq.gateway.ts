import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import Pusher from 'pusher';

type AnyJson = Record<string, any>;

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable payload]';
  }
}

@WebSocketGateway({
  path: '/ws/groq',
  cors: { origin: true, credentials: true },
})
export class GroqGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(GroqGateway.name);
  private readonly pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  });

  @WebSocketServer()
  server!: Server;

  handleConnection(client: WebSocket) {
    this.logger.log('✅ client connected');
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log('❌ client disconnected');
  }

  broadcast(payload: unknown): void {
    const msg = typeof payload === 'string' ? payload : JSON.stringify(payload);
    for (const client of this.server.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
    void this.triggerPusher(payload);
  }

  private async triggerPusher(payload: unknown): Promise<void> {
    try {
      const data = (typeof payload === 'string' ? JSON.parse(payload) : payload) as AnyJson;
      await this.pusher.trigger('groq-alerts', 'groq_anomaly', data);
      this.logger.log('📡 Pusher event triggered');
    } catch (err) {
      this.logger.error('Pusher trigger failed', err);
    }
  }

  afterInit(server: Server) {
    server.on('connection', (ws: WebSocket) => {
      ws.on('message', (raw) => {
        const msg = raw.toString();

        let payload: AnyJson | null = null;
        try {
          payload = JSON.parse(msg);
        } catch {
          // ignore non-json
        }

        if (payload?.type === 'groq_anomaly') {
          const start = payload?.frame_range?.start;
          const end = payload?.frame_range?.end;
          const label = payload?.result?.label;
          const score = payload?.result?.anomaly_score;
          const reason = payload?.result?.reason;
          const keyMoments = payload?.result?.key_moments;
          this.logger.log(
            `🚨 [groq_anomaly] range=${start}-${end} label=${label} score=${score} reason=${reason} key_moments=${safeStringify(
              keyMoments,
            )}`,
          );
          this.logger.debug(`🧾 groq full payload: ${safeStringify(payload)}`);
        } else {
          this.logger.log(`📦 got message: ${msg.slice(0, 180)}`);
        }

        for (const client of server.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
          }
        }

        void this.triggerPusher(payload ?? msg);
      });
    });
  }
}
