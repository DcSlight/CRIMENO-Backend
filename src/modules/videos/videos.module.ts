import { Module } from "@nestjs/common";
import { VideosController } from "./videos.controller";
import { VideosService } from "./videos.service";
import { BroadcasterModule } from "../broadcaster/barodcaster.module";
import { BusinessesModule } from "../businesses/businesses.module";
import { QwenModule } from "../qwen/qwen.module";

@Module({
  imports: [BroadcasterModule, BusinessesModule, QwenModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}