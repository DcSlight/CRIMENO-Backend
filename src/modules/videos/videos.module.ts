import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { BroadcasterModule } from '../broadcaster/barodcaster.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { GroqModule } from '../groq/groq.module';
import { DemoModule } from '../demo/demo.module';
import { ActiveSelectionModule } from '../selection/active-selection.module';

@Module({
  imports: [
    BroadcasterModule,
    BusinessesModule,
    GroqModule,
    DemoModule,
    ActiveSelectionModule,
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
