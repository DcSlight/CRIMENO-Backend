import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Business } from './business.entity';

export enum SensitivityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ScoringLevel {
  CONSERVATIVE = 'conservative',
  BALANCED = 'balanced',
  AGGRESSIVE = 'aggressive',
}

@Entity('business_policies')
export class BusinessPolicy {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ nullable: false })
  business_id!: number;

  @Column({
    type: 'enum',
    enum: SensitivityLevel,
    default: SensitivityLevel.MEDIUM,
  })
  sensitivity_level!: SensitivityLevel;

  @Column({
    type: 'enum',
    enum: ScoringLevel,
    default: ScoringLevel.BALANCED,
  })
  scoring_level!: ScoringLevel;

  @Column({
    type: 'enum',
    enum: SensitivityLevel,
    default: SensitivityLevel.MEDIUM,
  })
  interaction_sensitivity!: SensitivityLevel;

  @Column('text', { array: true, default: () => "'{}'" })
  allowed_behaviors!: string[];

  @Column('text', { array: true, default: () => "'{}'" })
  forbidden_behaviors!: string[];

  @OneToOne(() => Business, (business) => business.business_policy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business!: Business;
}