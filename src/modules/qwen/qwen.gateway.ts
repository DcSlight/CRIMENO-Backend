import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';

type AnyJson = Record<string, any>;

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable payload]';
  }
}

@WebSocketGateway({
  path: '/ws/qwen',
  cors: { origin: true, credentials: true },
})
export class QwenGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(QwenGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: WebSocket) {
    this.logger.log('✅ client connected');
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log('❌ client disconnected');
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

        if (payload?.type === 'qwen_anomaly') {
          const start = payload?.frame_range?.start;
          const end = payload?.frame_range?.end;
          const label = payload?.result?.label;
          const score = payload?.result?.anomaly_score;
          const reason = payload?.result?.reason;
          const keyMoments = payload?.result?.key_moments;
          this.logger.log(
            `🚨 qwen range=${start}-${end} label=${label} score=${score} reason=${reason} key_moments=${safeStringify(
              keyMoments,
            )}`,
          );
          this.logger.debug(`🧾 qwen full payload: ${safeStringify(payload)}`);
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
