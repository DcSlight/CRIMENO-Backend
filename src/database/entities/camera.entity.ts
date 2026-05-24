import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Business } from './business.entity';

@Entity('cameras')
export class Camera {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ nullable: false })
  business_id!: number;

  @Column({ nullable: false })
  camera_name!: string;

  @Column('text', { nullable: false })
  location_description!: string;

  @ManyToOne(() => Business, (business) => business.cameras, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business!: Business;
}
