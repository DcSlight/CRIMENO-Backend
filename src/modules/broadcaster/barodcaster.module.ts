import { Module } from "@nestjs/common";
import { BroadcasterService } from "./broadcaster.service";

@Module({
  providers: [BroadcasterService],
  exports: [BroadcasterService],
})
export class BroadcasterModule {}
