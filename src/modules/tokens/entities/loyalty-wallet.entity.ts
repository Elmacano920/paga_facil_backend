import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { ColumnNumericTransformer } from '../../../common/database/numeric-transformer';
import { TokenTransaction } from './token-transaction.entity';

@Entity('loyalty_wallets')
export class LoyaltyWallet extends BaseEntity {
  @Column({ type: 'uuid', unique: true })
  employeeId: string;

  @OneToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  balance: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  lockedBalance: number;

  @OneToMany(() => TokenTransaction, (tx) => tx.wallet)
  transactions: TokenTransaction[];
}