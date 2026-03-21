import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { BusinessHours } from './business-hours.entity';
import { BusinessRules } from './business-rules.entity';
import { Camera } from './camera.entity';

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

  @OneToMany(() => BusinessRules, (rules) => rules.business)
  business_rules!: BusinessRules[];

  @OneToMany(() => Camera, (camera) => camera.business)
  cameras!: Camera[];
}
