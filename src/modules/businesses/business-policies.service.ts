import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, BusinessPolicy } from '../../database/entities';
import { CreateBusinessPolicyDto } from './dto/create-business-policy.dto';
import { UpdateBusinessPolicyDto } from './dto/update-business-policy.dto';

@Injectable()
export class BusinessPoliciesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(BusinessPolicy)
    private readonly businessPolicyRepo: Repository<BusinessPolicy>,
  ) {}

  private async ensureBusinessExists(id: number): Promise<void> {
    const exists = await this.businessRepo.exist({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Business ${id} not found`);
    }
  }

  private async findOneBusinessPolicy(id: number): Promise<BusinessPolicy> {
    const policy = await this.businessPolicyRepo.findOne({
      where: { id },
      relations: { business: true },
    });

    if (!policy) {
      throw new NotFoundException(`BusinessPolicy ${id} not found`);
    }

    return policy;
  }

  async createBusinessPolicy(
    dto: CreateBusinessPolicyDto,
  ): Promise<BusinessPolicy> {
    await this.ensureBusinessExists(dto.business_id);

    const existingPolicy = await this.businessPolicyRepo.exist({
      where: { business_id: dto.business_id },
    });
    if (existingPolicy) {
      throw new ConflictException(
        `Business ${dto.business_id} already has a policy`,
      );
    }

    const policy = this.businessPolicyRepo.create({
      ...dto,
      allowed_behaviors: dto.allowed_behaviors ?? [],
      forbidden_behaviors: dto.forbidden_behaviors ?? [],
    });
    return this.businessPolicyRepo.save(policy);
  }

  async updateBusinessPolicy(
    id: number,
    dto: UpdateBusinessPolicyDto,
  ): Promise<BusinessPolicy> {
    const currentPolicy = await this.findOneBusinessPolicy(id);

    if (dto.business_id && dto.business_id !== currentPolicy.business_id) {
      await this.ensureBusinessExists(dto.business_id);

      const existingPolicy = await this.businessPolicyRepo.exist({
        where: { business_id: dto.business_id },
      });
      if (existingPolicy) {
        throw new ConflictException(
          `Business ${dto.business_id} already has a policy`,
        );
      }
    }

    await this.businessPolicyRepo.update(id, dto);
    return this.findOneBusinessPolicy(id);
  }

  async removeBusinessPolicy(id: number): Promise<void> {
    const result = await this.businessPolicyRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`BusinessPolicy ${id} not found`);
    }
  }
}