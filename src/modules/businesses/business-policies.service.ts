import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business, BusinessPolicy } from '../../database/entities';
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

  async findBusinessPolicyByBusinessId(
    businessId: number,
  ): Promise<BusinessPolicy> {
    await this.ensureBusinessExists(businessId);

    const policy = await this.businessPolicyRepo.findOne({
      where: { business_id: businessId },
      relations: { business: true },
    });

    if (!policy) {
      throw new NotFoundException(
        `BusinessPolicy for business ${businessId} not found`,
      );
    }

    return policy;
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
}