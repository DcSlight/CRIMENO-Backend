import { Controller, Get } from "@nestjs/common";
import { VideosService, VideoOptionDto } from "./videos.service";

@Controller("videos")
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  getVideos(): VideoOptionDto[] {
    return this.videosService.getVideoOptions();
  }
}
