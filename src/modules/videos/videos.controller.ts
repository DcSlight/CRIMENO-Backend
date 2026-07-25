import { Body, Controller, Get, Post, UseInterceptors } from "@nestjs/common";
import { VideosService, VideoOptionDto } from "./videos.service";
import { SelectVideoDto } from "./dto/select-video.dto";
import { Demo } from "../demo/demo.decorator";
import { DemoInterceptor } from "../demo/demo.interceptor";

@Controller("videos")
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  getVideos(): VideoOptionDto[] {
    return this.videosService.getVideoOptions();
  }

  @Post("selection")
  @Demo()
  @UseInterceptors(DemoInterceptor)
  async select(@Body() body: SelectVideoDto) {
    console.log(body);
    await this.videosService.selectVideo(body.src, body.videoType, body.businessId, body.includeContext);
    return { ok: true };
  }
}
