import { Injectable } from "@nestjs/common";
import * as zmq from "zeromq";

@Injectable()
export class BroadcasterService {
  private sock = new zmq.Request();

  constructor() {
    this.sock.connect("tcp://127.0.0.1:5561");
  }

  async playVideo(videoPath: string) {
    await this.sock.send(
      JSON.stringify({
        cmd: "play",
        video: videoPath,
      }),
    );
    await this.sock.receive();
  }
}
