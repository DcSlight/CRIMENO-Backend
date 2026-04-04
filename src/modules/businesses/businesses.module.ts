import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business, BusinessHours, BusinessRules, Camera } from '../../database/entities';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { QwenModule } from '../qwen/qwen.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessHours, BusinessRules, Camera]),
    QwenModule,
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
})
export class BusinessesModule {}
