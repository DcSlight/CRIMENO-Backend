import { Body, Controller, Get, Post } from "@nestjs/common";
import { VideosService, VideoOptionDto } from "./videos.service";
import { SelectVideoDto } from "./dto/select-video.dto";

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

  @Post("selection")
  async select(@Body() body: SelectVideoDto) {
    console.log(body);
    await this.videosService.selectVideo(body.src);
    return { ok: true };
  }
}
