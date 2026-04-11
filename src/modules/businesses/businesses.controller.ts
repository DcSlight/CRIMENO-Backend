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

@ApiTags('businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @ApiOperation({
    summary:
      'Create business and related rows (hours, cameras) with a single JSON payload',
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
}
