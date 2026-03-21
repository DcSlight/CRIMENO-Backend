import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Business } from './business.entity';

@Entity('business_rules')
export class BusinessRules {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ nullable: false })
  business_id!: number;

  @Column('text', { nullable: false })
  rule_description!: string;

  @ManyToOne(() => Business, (business) => business.business_rules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business!: Business;
}
