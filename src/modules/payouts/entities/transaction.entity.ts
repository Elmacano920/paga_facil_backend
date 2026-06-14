import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { AdvanceRequest } from '../../advances/entities/advance-request.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ type: 'uuid' })
  advanceRequestId: string;

  @OneToOne(() => AdvanceRequest, (advance) => advance.transaction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advanceRequestId' })
  advanceRequest: AdvanceRequest;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  pagoMovilRef: string | null;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ type: 'timestamp', nullable: true })
  settledAt: Date;
}
