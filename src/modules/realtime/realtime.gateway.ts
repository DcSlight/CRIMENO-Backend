import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    // You can add auth later (JWT, etc.)
    // eslint-disable-next-line no-console
    console.log(`[WS] client connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // eslint-disable-next-line no-console
    console.log(`[WS] client disconnected ${client.id}`);
  }

  emitUpdate(frameId: number, payload: unknown) {
    this.server.emit('frame_update', { frameId, payload });
  }

  emitFrame(frameId: number, payload: unknown) {
    this.server.emit('frame', { frameId, payload });
  }
}
