import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Business } from './business.entity';

@Entity('business_hours')
export class BusinessHours {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ nullable: false })
  business_id!: number;

  @Column({ nullable: false })
  day_of_week!: string;

  @Column('time', { nullable: false })
  opening_time!: string;

  @Column('time', { nullable: false })
  closing_time!: string;

  @ManyToOne(() => Business, (business) => business.business_hours, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business!: Business;
}
