import { Module } from "@nestjs/common";
import { PromptsGateway } from "./prompts.gateway";

@Module({
  providers: [PromptsGateway],
})
export class PromptsModule {}