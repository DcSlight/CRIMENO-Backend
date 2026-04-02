import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business, BusinessHours, BusinessRules, Camera } from '../../database/entities';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { BroadcasterModule } from '../broadcaster/barodcaster.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessHours, BusinessRules, Camera]),
    BroadcasterModule,
  ],
  controllers: [BusinessesController],
  providers: [BusinessesService],
})
export class BusinessesModule {}
