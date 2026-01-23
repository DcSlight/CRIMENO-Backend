import { Body, Controller, Get, Post } from "@nestjs/common";
import { VideosService, VideoOptionDto } from "./videos.service";

@Controller("videos")
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  // -----------------------------
  // GET /videos
  // -----------------------------
  @Get()
  getVideos(): VideoOptionDto[] {
    return this.videosService.getVideoOptions();
  }

  // -----------------------------
  // POST /videos/select
  // -----------------------------
  @Post("selection")
  async select(@Body() body: { src: string }) {
    await this.videosService.selectVideo(body.src);
    return { ok: true };
  }
}
