import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { ColumnNumericTransformer } from '../../../common/database/numeric-transformer';
import { Employee } from '../../employees/entities/employee.entity';
import { Transaction } from '../../payouts/entities/transaction.entity';

export enum AdvanceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
}

@Entity('advance_requests')
export class AdvanceRequest extends BaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, (employee) => employee.advanceRequests, { onDelete: 'CASCADE' })
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
  fee: number;

  @Column({
    type: 'enum',
    enum: AdvanceStatus,
    default: AdvanceStatus.PENDING,
  })
  status: AdvanceStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestDate: Date;

  @OneToOne(() => Transaction, (transaction) => transaction.advanceRequest)
  transaction: Transaction;
}
