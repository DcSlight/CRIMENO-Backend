import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';

type AnyJson = Record<string, any>;

@WebSocketGateway({
  path: '/ws/florence',
  cors: { origin: true, credentials: true },
})
export class FlorenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(FlorenceGateway.name);

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

        if (payload?.type === 'florence_frame') {
          const frame = payload.frame_index;
          const t = payload.video_time_ms;
          const caption: string = payload?.caption ?? '';
          const weapons = payload?.weapons_detected?.length ?? 0;
          const objects = payload?.objects?.length ?? 0;
          const captionShort = caption.replace(/\s+/g, ' ').slice(0, 100);
          this.logger.log(
            `🧠 florence frame=${frame} t=${t}ms objects=${objects} weapons=${weapons} | ${captionShort}`,
          );
        } else {
          this.logger.log(`📦 got message: ${msg.slice(0, 180)}`);
        }

        for (const client of server.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
          }
        }
      });
    });
  }
}
