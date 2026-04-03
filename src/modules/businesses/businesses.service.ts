import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, BusinessHours, BusinessRules, Camera } from '../../database/entities';
import { CreateBusinessGraphDto } from './dto/create-business-graph.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { CreateBusinessHoursDto } from './dto/create-business-hours.dto';
import { UpdateBusinessHoursDto } from './dto/update-business-hours.dto';
import { CreateBusinessRuleDto } from './dto/create-business-rule.dto';
import { UpdateBusinessRuleDto } from './dto/update-business-rule.dto';
import { CreateCameraDto } from './dto/create-camera.dto';
import { UpdateCameraDto } from './dto/update-camera.dto';
import { QwenContextService } from '../qwen/qwen-context.service';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(BusinessHours)
    private readonly businessHoursRepo: Repository<BusinessHours>,
    @InjectRepository(BusinessRules)
    private readonly businessRulesRepo: Repository<BusinessRules>,
    @InjectRepository(Camera)
    private readonly cameraRepo: Repository<Camera>,
    private readonly qwenContext: QwenContextService,
  ) {}

  private async ensureBusinessExists(id: number): Promise<void> {
    const exists = await this.businessRepo.exist({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Business ${id} not found`);
    }
  }

  async createBusiness(dto: CreateBusinessGraphDto): Promise<Business> {
    return this.businessRepo.manager.transaction(async (manager) => {
      const businessRepo = manager.getRepository(Business);
      const hoursRepo = manager.getRepository(BusinessHours);
      const rulesRepo = manager.getRepository(BusinessRules);
      const camerasRepo = manager.getRepository(Camera);

      const business = await businessRepo.save(
        businessRepo.create({
          store_name: dto.store_name,
          store_type: dto.store_type,
          description: dto.description,
          city: dto.city,
          address: dto.address,
        }),
      );

      if (dto.business_hours?.length) {
        const hours = dto.business_hours.map((item) =>
          hoursRepo.create({
            business_id: business.id,
            day_of_week: item.day_of_week,
            opening_time: item.opening_time,
            closing_time: item.closing_time,
          }),
        );
        await hoursRepo.save(hours);
      }

      if (dto.business_rules?.length) {
        const rules = dto.business_rules.map((item) =>
          rulesRepo.create({
            business_id: business.id,
            rule_description: item.rule_description,
          }),
        );
        await rulesRepo.save(rules);
      }

      if (dto.cameras?.length) {
        const cameras = dto.cameras.map((item) =>
          camerasRepo.create({
            business_id: business.id,
            camera_name: item.camera_name,
            location_description: item.location_description,
          }),
        );
        await camerasRepo.save(cameras);
      }

      const created = await businessRepo.findOne({
        where: { id: business.id },
        relations: {
          business_hours: true,
          business_rules: true,
          cameras: true,
        },
      });

      if (!created) {
        throw new NotFoundException(`Business ${business.id} not found`);
      }

      return created;
    });
  }

  async findAllBusinesses(): Promise<Business[]> {
    return this.businessRepo.find({
      relations: {
        business_hours: true,
        business_rules: true,
        cameras: true,
      },
    });
  }

  async findOneBusiness(id: number): Promise<Business> {
    const business = await this.businessRepo.findOne({
      where: { id },
      relations: {
        business_hours: true,
        business_rules: true,
        cameras: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business ${id} not found`);
    }

    return business;
  }

  async updateBusiness(id: number, dto: UpdateBusinessDto): Promise<Business> {
    await this.findOneBusiness(id);
    await this.businessRepo.update(id, dto);
    return this.findOneBusiness(id);
  }

  async removeBusiness(id: number): Promise<void> {
    const result = await this.businessRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Business ${id} not found`);
    }
  }

  async createBusinessHours(dto: CreateBusinessHoursDto): Promise<BusinessHours> {
    await this.ensureBusinessExists(dto.business_id);
    const hours = this.businessHoursRepo.create(dto);
    return this.businessHoursRepo.save(hours);
  }

  async findAllBusinessHours(): Promise<BusinessHours[]> {
    return this.businessHoursRepo.find({ relations: { business: true } });
  }

  async findOneBusinessHours(id: number): Promise<BusinessHours> {
    const hours = await this.businessHoursRepo.findOne({
      where: { id },
      relations: { business: true },
    });

    if (!hours) {
      throw new NotFoundException(`BusinessHours ${id} not found`);
    }

    return hours;
  }

  async updateBusinessHours(
    id: number,
    dto: UpdateBusinessHoursDto,
  ): Promise<BusinessHours> {
    await this.findOneBusinessHours(id);
    if (dto.business_id) {
      await this.ensureBusinessExists(dto.business_id);
    }
    await this.businessHoursRepo.update(id, dto);
    return this.findOneBusinessHours(id);
  }

  async removeBusinessHours(id: number): Promise<void> {
    const result = await this.businessHoursRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`BusinessHours ${id} not found`);
    }
  }

  async createBusinessRule(dto: CreateBusinessRuleDto): Promise<BusinessRules> {
    await this.ensureBusinessExists(dto.business_id);
    const rule = this.businessRulesRepo.create(dto);
    return this.businessRulesRepo.save(rule);
  }

  async findAllBusinessRules(): Promise<BusinessRules[]> {
    return this.businessRulesRepo.find({ relations: { business: true } });
  }

  async findOneBusinessRule(id: number): Promise<BusinessRules> {
    const rule = await this.businessRulesRepo.findOne({
      where: { id },
      relations: { business: true },
    });

    if (!rule) {
      throw new NotFoundException(`BusinessRule ${id} not found`);
    }

    return rule;
  }

  async updateBusinessRule(
    id: number,
    dto: UpdateBusinessRuleDto,
  ): Promise<BusinessRules> {
    await this.findOneBusinessRule(id);
    if (dto.business_id) {
      await this.ensureBusinessExists(dto.business_id);
    }
    await this.businessRulesRepo.update(id, dto);
    return this.findOneBusinessRule(id);
  }

  async removeBusinessRule(id: number): Promise<void> {
    const result = await this.businessRulesRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`BusinessRule ${id} not found`);
    }
  }

  async createCamera(dto: CreateCameraDto): Promise<Camera> {
    await this.ensureBusinessExists(dto.business_id);
    const camera = this.cameraRepo.create(dto);
    return this.cameraRepo.save(camera);
  }

  async findAllCameras(): Promise<Camera[]> {
    return this.cameraRepo.find({ relations: { business: true } });
  }

  async findOneCamera(id: number): Promise<Camera> {
    const camera = await this.cameraRepo.findOne({
      where: { id },
      relations: { business: true },
    });

    if (!camera) {
      throw new NotFoundException(`Camera ${id} not found`);
    }

    return camera;
  }

  async updateCamera(id: number, dto: UpdateCameraDto): Promise<Camera> {
    await this.findOneCamera(id);
    if (dto.business_id) {
      await this.ensureBusinessExists(dto.business_id);
    }
    await this.cameraRepo.update(id, dto);
    return this.findOneCamera(id);
  }

  async removeCamera(id: number): Promise<void> {
    const result = await this.cameraRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Camera ${id} not found`);
    }
  }

  async getBusinessBroadcastPayload(id: number) {
    const business = await this.findOneBusiness(id);
    return {
      type: 'business_context' as const,
      context: business,
      data: business,
    };
  }

  async broadcastBusiness(id: number) {
    const payload = await this.getBusinessBroadcastPayload(id);
    await this.qwenContext.sendBusinessContext(payload.context);
    return payload;
  }
}
