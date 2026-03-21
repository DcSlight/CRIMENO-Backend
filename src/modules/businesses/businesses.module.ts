import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business, BusinessHours, BusinessRules, Camera } from '../../database/entities';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Business, BusinessHours, BusinessRules, Camera])],
  controllers: [BusinessesController],
  providers: [BusinessesService],
})
export class BusinessesModule {}
