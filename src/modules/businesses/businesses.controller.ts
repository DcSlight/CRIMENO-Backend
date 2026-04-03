import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessGraphDto } from './dto/create-business-graph.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';
import { UpdateBusinessRuleDto } from './dto/update-business-rule.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';

@ApiTags('businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) { }

  @ApiOperation({
    summary:
      'Create business and related rows (hours, rules, cameras) with a single JSON payload',
  })
  @ApiBody({ type: CreateBusinessGraphDto })
  @Post()
  createBusiness(@Body() dto: CreateBusinessGraphDto) {
    return this.businessesService.createBusiness(dto);
  }

  @Get()
  findAllBusinesses() {
    return this.businessesService.findAllBusinesses();
  }

  @Patch(':id')
  updateBusiness(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessesService.updateBusiness(id, dto);
  }

  @Delete(':id')
  async removeBusiness(@Param('id', ParseIntPipe) id: number) {
    await this.businessesService.removeBusiness(id);
    return { ok: true };
  }

  @Get('hours/all')
  findAllBusinessHours() {
    return this.businessesService.findAllBusinessHours();
  }

  @Get('hours/:id')
  findOneBusinessHours(@Param('id', ParseIntPipe) id: number) {
    return this.businessesService.findOneBusinessHours(id);
  }

  @Patch('hours/:id')
  updateBusinessHours(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBusinessHoursDto,
  ) {
    return this.businessesService.updateBusinessHours(id, dto);
  }

  @Delete('hours/:id')
  async removeBusinessHours(@Param('id', ParseIntPipe) id: number) {
    await this.businessesService.removeBusinessHours(id);
    return { ok: true };
  }

  @Get('rules/all')
  findAllBusinessRules() {
    return this.businessesService.findAllBusinessRules();
  }

  @Get('rules/:id')
  findOneBusinessRule(@Param('id', ParseIntPipe) id: number) {
    return this.businessesService.findOneBusinessRule(id);
  }

  @Patch('rules/:id')
  updateBusinessRule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBusinessRuleDto,
  ) {
    return this.businessesService.updateBusinessRule(id, dto);
  }

  @Delete('rules/:id')
  async removeBusinessRule(@Param('id', ParseIntPipe) id: number) {
    await this.businessesService.removeBusinessRule(id);
    return { ok: true };
  }

  @Get('cameras/all')
  findAllCameras() {
    return this.businessesService.findAllCameras();
  }

  @Get('cameras/:id')
  findOneCamera(@Param('id', ParseIntPipe) id: number) {
    return this.businessesService.findOneCamera(id);
  }

  @Get(':id')
  findOneBusiness(@Param('id', ParseIntPipe) id: number) {
    return this.businessesService.findOneBusiness(id);
  }

  @Get(':id/broadcast/preview')
  previewBroadcastBusiness(@Param('id', ParseIntPipe) id: number) {
    return this.businessesService.getBusinessBroadcastPayload(id);
  }

  @Post(':id/broadcast')
  async broadcastBusiness(@Param('id', ParseIntPipe) id: number) {
    try {
      const payload = await this.businessesService.broadcastBusiness(id);
      return {
        success: true,
        status: 'sent',
        data: payload.data,
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Patch('cameras/:id')
  updateCamera(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCameraDto,
  ) {
    return this.businessesService.updateCamera(id, dto);
  }

  @Delete('cameras/:id')
  async removeCamera(@Param('id', ParseIntPipe) id: number) {
    await this.businessesService.removeCamera(id);
    return { ok: true };
  }
}
