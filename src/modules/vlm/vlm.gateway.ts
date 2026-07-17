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
  path: '/ws/vlm',
  cors: { origin: true, credentials: true },
})
export class VlmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(VlmGateway.name);

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

        if (payload?.type === 'vlm_frame') {
          const frame = payload.frame_index;
          const t = payload.video_time_ms;
          const qa = payload?.qa ?? {};
          const description: string = qa?.description ?? '';
          const gun = qa?.gun ?? 'no';
          const knife = qa?.knife ?? 'no';
          const descShort = description.replace(/\s+/g, ' ').slice(0, 100);
          this.logger.log(
            `🧠 vlm frame=${frame} t=${t}ms gun=${gun} knife=${knife} | ${descShort}`,
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
