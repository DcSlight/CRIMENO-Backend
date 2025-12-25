import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

@WebSocketGateway({
  path: '/ws/stream',
})
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: WebSocket, req: IncomingMessage) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'unknown';

    console.log(`[WS] Client connected. ip=${ip}`);

    client.on('message', (data) => {
      const text = data.toString();
      console.log(`[WS] Received message: ${text}`);
    });

    client.on('error', (err) => {
      console.log(`[WS] Client error: ${err.message}`);
    });
  }

  handleDisconnect() {
    console.log(`[WS] Client disconnected`);
  }

  broadcast(obj: unknown) {
    const msg = JSON.stringify(obj);
    this.server.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) c.send(msg);
    });
  }
}
