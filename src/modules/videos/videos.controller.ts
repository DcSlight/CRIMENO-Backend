import { Body, Controller, Get, Post } from "@nestjs/common";
import { VideosService, VideoOptionDto } from "./videos.service";
import { VideoSelectionDto } from "./dto/video.dto";

@Controller("videos")
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  getVideos(): VideoOptionDto[] {
    return this.videosService.getVideoOptions();
  }

  @Post("selection")
  saveSelection(@Body() body: VideoSelectionDto) {
    this.videosService.handleSelection(body);
    return { ok: true };
  }
}
