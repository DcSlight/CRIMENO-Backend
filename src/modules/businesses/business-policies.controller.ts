import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessPoliciesService } from './business-policies.service';
import { CreateBusinessPolicyDto } from './dto/create-business-policy.dto';
import { UpdateBusinessPolicyDto } from './dto/update-business-policy.dto';

@ApiTags('business-policies')
@Controller('business-policies')
export class BusinessPoliciesController {
  constructor(
    private readonly businessPoliciesService: BusinessPoliciesService,
  ) {}

  @ApiOperation({
    summary: 'Create policy settings for business sensitivity and behavior laws',
  })
  @ApiBody({ type: CreateBusinessPolicyDto })
  @Post()
  createBusinessPolicy(@Body() dto: CreateBusinessPolicyDto) {
    return this.businessPoliciesService.createBusinessPolicy(dto);
  }

  @ApiOperation({
    summary: 'Update policy settings for business sensitivity and behavior laws',
  })
  @ApiBody({ type: UpdateBusinessPolicyDto })
  @Patch(':id')
  updateBusinessPolicy(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBusinessPolicyDto,
  ) {
    return this.businessPoliciesService.updateBusinessPolicy(id, dto);
  }

  @ApiOperation({ summary: 'Delete business policy settings' })
  @Delete(':id')
  async removeBusinessPolicy(@Param('id', ParseIntPipe) id: number) {
    await this.businessPoliciesService.removeBusinessPolicy(id);
    return { ok: true };
  }
}