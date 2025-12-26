import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocketServer as WSServer, WebSocket } from 'ws';

@WebSocketGateway({
  path: '/ws/tracker',
  cors: { origin: true, credentials: true },
})
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(StreamGateway.name);

  @WebSocketServer()
  server!: WSServer;

  handleConnection(client: WebSocket, req: IncomingMessage) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    this.logger.log(`✅ client connected ip=${ip} url=${req.url}`);

    // בדיוק כמו ws_test_server: להדפיס כל msg שנכנס (snippet)
    client.on('message', (data) => {
      const msg = data.toString();
      this.logger.log(`📦 got message: ${msg.slice(0, 160)}`);

      // אינדיקציה “קיבלתי פריימים + BBOX”
      try {
        const payload = JSON.parse(msg);
        const frameIndex = payload?.frame_index;
        const t = payload?.video_time_ms;
        const tracksCount = Array.isArray(payload?.tracks)
          ? payload.tracks.length
          : 0;
        const hasOverlay = typeof payload?.overlay_jpg_b64 === 'string';

        this.logger.log(
          `🎞️ frame=${frameIndex} t=${t}ms tracks=${tracksCount} overlay=${hasOverlay}`,
        );
      } catch (e) {
        this.logger.warn(`⚠️ message is not valid JSON`);
      }

      // ברודקאסט לכל ה־clients (כולל React בהמשך)
      this.broadcastRaw(msg);

      // ACK קטן כדי שתדע שהשרת קיבל (אופציונלי, עוזר לדיבוג)
      try {
        client.send(JSON.stringify({ type: 'ack', ok: true }));
      } catch {}
    });
  }

  handleDisconnect() {
    this.logger.log(`❌ client disconnected`);
  }

  private broadcastRaw(raw: string) {
    // משדר לכולם. בהמשך React פשוט יתחבר לפה ויקבל את אותו JSON.
    for (const c of this.server.clients) {
      if (c.readyState === WebSocket.OPEN) {
        c.send(raw);
      }
    }
  }
}
