import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessPoliciesService } from './business-policies.service';
import { UpdateBusinessPolicyDto } from './dto/update-business-policy.dto';

@ApiTags('business-policies')
@Controller('business-policies')
export class BusinessPoliciesController {
  constructor(
    private readonly businessPoliciesService: BusinessPoliciesService,
  ) {}

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
}