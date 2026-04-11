import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Business,
  BusinessHours,
  BusinessPolicy,
  Camera,
} from '../../database/entities';
import { BusinessPoliciesController } from './business-policies.controller';
import { BusinessPoliciesService } from './business-policies.service';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { QwenModule } from '../qwen/qwen.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      BusinessHours,
      Camera,
      BusinessPolicy,
    ]),
    QwenModule,
  ],
  controllers: [BusinessesController, BusinessPoliciesController],
  providers: [BusinessesService, BusinessPoliciesService],
})
export class BusinessesModule {}
