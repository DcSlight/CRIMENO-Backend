import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/stream',
})
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    // Logs so you'll see something immediately
    // eslint-disable-next-line no-console
    console.log(`[WS] client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // eslint-disable-next-line no-console
    console.log(`[WS] client disconnected: ${client.id}`);
  }

  emitFrame(payload: any) {
    this.server.emit('frame', payload);
  }

  emitTracker(payload: any) {
    this.server.emit('tracker', payload);
  }

  emitFlorence(payload: any) {
    this.server.emit('florence', payload);
  }
}
