import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/stream',
})
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger('StreamGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: id=${client.id} ip=${client.handshake.address}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: id=${client.id}`);
  }

  // Python -> NestJS : tracker event
  @SubscribeMessage('tracker')
  onTracker(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    this.logger.log(
      `[IN tracker] from=${client.id} keys=${payload ? Object.keys(payload).join(',') : 'null'}`,
    );
    // אם בא לך לראות חלק מהתוכן:
    // this.logger.debug(JSON.stringify(payload).slice(0, 500));

    // אופציונלי: לשדר לכולם (React)
    this.server.emit('tracker', payload);
  }

  // Python -> NestJS : florence event
  @SubscribeMessage('florence')
  onFlorence(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    this.logger.log(`[IN florence] from=${client.id}`);
    this.server.emit('florence', payload);
  }

  // (אם עדיין אתה רוצה NestJS -> React)
  emitFrame(payload: any) {
    this.server.emit('frame', payload);
  }
}
