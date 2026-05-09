import { Injectable } from '@nestjs/common';
import * as zmq from 'zeromq';

@Injectable()
export class GroqContextService {
  private readonly sock = new zmq.Push();

  constructor() {
    this.sock.connect('tcp://127.0.0.1:5581');
  }

  async sendBusinessContext(context: unknown) {
    await this.sock.send(
      JSON.stringify({
        type: 'business_context',
        context,
      }),
    );
  }
}
