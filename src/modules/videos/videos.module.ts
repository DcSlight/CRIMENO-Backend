import { Module } from "@nestjs/common";
import { VideosController } from "./videos.controller";
import { VideosService } from "./videos.service";
import { BroadcasterModule } from "../broadcaster/barodcaster.module";
import { BusinessesModule } from "../businesses/businesses.module";
import { GroqModule } from "../groq/groq.module";

@Module({
  imports: [BroadcasterModule, BusinessesModule, GroqModule],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}