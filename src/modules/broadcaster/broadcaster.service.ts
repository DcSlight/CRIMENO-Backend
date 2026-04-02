import { Injectable } from "@nestjs/common";
import * as zmq from "zeromq";

@Injectable()
export class BroadcasterService {
  private sock = new zmq.Request();

  constructor() {
    this.sock.connect("tcp://127.0.0.1:5561");
  }

  async playVideo(videoPath: string, videoType: "local" | "online") {
    await this.sock.send(
      JSON.stringify({
        cmd: "play",
        video: videoPath,
        videoType: videoType,
      }),
    );
    await this.sock.receive();
  }

  async broadcastBusinessData(data: unknown) {
    await this.sock.send(
      JSON.stringify({
        cmd: "business_data",
        data,
      }),
    );
    await this.sock.receive();
  }
}
