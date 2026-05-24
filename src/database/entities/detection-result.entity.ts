import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Business } from './business.entity';

@Entity('detection_results')
export class DetectionResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ nullable: false })
  business_id!: number;

  @Column({ type: 'json', nullable: true })
  florence_output!: object | null;

  @Column({ type: 'json', nullable: true })
  qwen_output!: object | null;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Business, (business) => business.detection_results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business!: Business;
}
