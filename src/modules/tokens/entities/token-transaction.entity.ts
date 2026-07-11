import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { LoyaltyWallet } from './loyalty-wallet.entity';
import { ColumnNumericTransformer } from '../../../common/database/numeric-transformer';

export enum TokenTxType {
  MINT = 'MINT',
  BURN = 'BURN',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

@Entity('token_transactions')
export class TokenTransaction extends BaseEntity {
  @Column({ type: 'uuid' })
  walletId: string;

  @ManyToOne(() => LoyaltyWallet, (w) => w.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet: LoyaltyWallet;

  @Column({ type: 'enum', enum: TokenTxType })
  type: TokenTxType;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({ type: 'varchar', length: 100 })
  reason: string;

  @Column({ type: 'uuid', nullable: true })
  txRef: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  balanceAfter: number;
}