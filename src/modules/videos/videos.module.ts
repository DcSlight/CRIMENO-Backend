import { Module } from "@nestjs/common";
import { VideosController } from "./videos.controller";
import { VideosService } from "./videos.service";
import { BroadcasterService } from "../broadcaster/broadcaster.service";
import { BroadcasterModule } from "../broadcaster/barodcaster.module";

@Module({
   imports: [BroadcasterModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}