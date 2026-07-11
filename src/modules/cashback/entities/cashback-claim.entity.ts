import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { AdvanceRequest } from '../../advances/entities/advance-request.entity';
import { ColumnNumericTransformer } from '../../../common/database/numeric-transformer';

@Entity('cashback_claims')
export class CashbackClaim extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  @Index()
  advanceRequestId: string;

  @ManyToOne(() => AdvanceRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advanceRequestId' })
  advanceRequest: AdvanceRequest;

  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amountRequested: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  cashbackUSD: number;

  @Column({ type: 'varchar', length: 20 })
  tier: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 4,
    transformer: new ColumnNumericTransformer(),
  })
  rate: number;

  @Column({ type: 'int', default: 0 })
  tokensEarned: number;

  @Column({ type: 'int', default: 0 })
  bonusTokens: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  claimedAt: Date;
}