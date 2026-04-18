import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BusinessHours } from './business-hours.entity';
import { Camera } from './camera.entity';
import { BusinessPolicy } from './business-policy.entity';
import { DetectionResult } from './detection-result.entity';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  store_name!: string;

  @Column({ nullable: false })
  store_type!: string;

  @Column('text', { nullable: false })
  description!: string;

  @Column({ nullable: false })
  city!: string;

  @Column({ nullable: false })
  address!: string;

  @OneToMany(() => BusinessHours, (hours) => hours.business)
  business_hours!: BusinessHours[];

  @OneToMany(() => Camera, (camera) => camera.business)
  cameras!: Camera[];

  @OneToOne(() => BusinessPolicy, (policy) => policy.business)
  business_policy?: BusinessPolicy;

  @OneToMany(() => DetectionResult, (result) => result.business)
  detection_results!: DetectionResult[];
}
