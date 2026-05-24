import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, BusinessHours, BusinessPolicy, Camera } from '../../database/entities';
import { CreateBusinessGraphDto } from './dto/create-business-graph.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

  async createBusiness(dto: CreateBusinessGraphDto): Promise<Business> {
    return this.businessRepo.manager.transaction(async (manager) => {
      const businessRepo = manager.getRepository(Business);
      const hoursRepo = manager.getRepository(BusinessHours);
      const businessPolicyRepo = manager.getRepository(BusinessPolicy);
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

      // Ensure each business always has one policy row with defaults.
      await businessPolicyRepo.save(
        businessPolicyRepo.create({
          business_id: business.id,
          sensitivity_level: dto.business_policy?.sensitivity_level,
          scoring_level: dto.business_policy?.scoring_level,
          interaction_sensitivity: dto.business_policy?.interaction_sensitivity,
          allowed_behaviors: dto.business_policy?.allowed_behaviors ?? [],
          forbidden_behaviors: dto.business_policy?.forbidden_behaviors ?? [],
        }),
      );

      const created = await businessRepo.findOne({
        where: { id: business.id },
        relations: {
          business_hours: true,
          business_policy: true,
          cameras: true,
        },
      });

      if (!created) {
        throw new NotFoundException(`Business ${business.id} not found`);
      }

      return created;
    });
  }

  async findBusinessById(id: number): Promise<Business> {
    const business = await this.businessRepo.findOne({
      where: { id },
      relations: {
        business_hours: true,
        business_policy: true,
        cameras: true,
      },
    });

    if (!business) {
      throw new NotFoundException(`Business ${id} not found`);
    }

    return business;
  }

  async findAllBusinesses(): Promise<Business[]> {
    return this.businessRepo.find({
      relations: {
        business_hours: true,
        business_policy: true,
        cameras: true,
      },
    });
  }

  async updateBusiness(id: number, dto: UpdateBusinessDto): Promise<Business> {
    const current = await this.businessRepo.findOne({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Business ${id} not found`);
    }

    await this.businessRepo.update(id, dto);

    const updated = await this.businessRepo.findOne({
      where: { id },
      relations: {
        business_hours: true,
        business_policy: true,
        cameras: true,
      },
    });

    if (!updated) {
      throw new NotFoundException(`Business ${id} not found`);
    }

    return updated;
  }

  async removeBusiness(id: number): Promise<void> {
    const result = await this.businessRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Business ${id} not found`);
    }
  }
}
