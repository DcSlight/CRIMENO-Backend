import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import Expo from 'expo-server-sdk';

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
  private readonly expo = new Expo();

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
    void this.sendPushIfNeeded(payload);
  }

  private async sendPushIfNeeded(payload: unknown): Promise<void> {
    const token = process.env.EXPO_PUSH_TOKEN;
    if (!token || !Expo.isExpoPushToken(token)) return;

    const p = payload as AnyJson;
    if (p?.['type'] !== 'groq_anomaly') return;

    const label: string = p?.['result']?.['label'];
    if (label !== 'criminal' && label !== 'suspicious') return;

    const reason: string = p?.['result']?.['reason'] || 'Anomaly detected.';
    const isCriminal = label === 'criminal';

    try {
      await this.expo.sendPushNotificationsAsync([{
        to: token,
        sound: 'default',
        title: isCriminal ? '🚨 Critical Alert – CrimeNo' : '⚠️ Suspicious Activity – CrimeNo',
        body: reason,
      }]);
      this.logger.log(`📲 Push notification sent to ${token.slice(0, 30)}…`);
    } catch (err) {
      this.logger.error('Push notification failed', err);
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
      });
    });
  }
}
