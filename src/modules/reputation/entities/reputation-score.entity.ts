import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';

export enum EntityType {
  EMPLOYEE = 'EMPLOYEE',
  COMPANY = 'COMPANY',
}

export enum ReputationTier {
  BRONCE = 'Bronce',
  PLATA = 'Plata',
  ORO = 'Oro',
  PLATINO = 'Platino',
  ELITE = 'Elite',
}

@Entity('reputation_scores')
@Index(['entityId', 'entityType'], { unique: true })
export class ReputationScore extends BaseEntity {
  @Column({ type: 'uuid' })
  entityId: string;

  @Column({ type: 'enum', enum: EntityType })
  entityType: EntityType;

  @Column({ type: 'int', default: 50 })
  score: number;

  @Column({
    type: 'enum',
    enum: ReputationTier,
    default: ReputationTier.PLATA,
  })
  tier: ReputationTier;

  @Column({ type: 'jsonb', nullable: true })
  breakdown: Record<string, any>;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
}