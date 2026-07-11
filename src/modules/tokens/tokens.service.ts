import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoyaltyWallet } from './entities/loyalty-wallet.entity';
import { TokenTransaction, TokenTxType } from './entities/token-transaction.entity';

export const TOKEN_REWARDS = {
  TX_VALIDATED: 10,
  CASHBACK_CLAIMED: 5,
  REVIEW_PUBLISHED: 15,
  REVIEW_HELPFUL_VOTE: 3,
  FIRST_USE_MONTHLY: 25,
  MERCHANT_VERIFIED: 50,
  DISPUTE_WON: 20,
  REFERRAL_BONUS: 30,
} as const;

export type RewardKey = keyof typeof TOKEN_REWARDS;

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(LoyaltyWallet)
    private walletRepo: Repository<LoyaltyWallet>,
    @InjectRepository(TokenTransaction)
    private txRepo: Repository<TokenTransaction>,
  ) {}

  async getOrCreateWallet(employeeId: string): Promise<LoyaltyWallet> {
    let wallet = await this.walletRepo.findOne({ where: { employeeId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ employeeId, balance: 0, lockedBalance: 0 });
      await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async getWallet(employeeId: string): Promise<LoyaltyWallet> {
    const wallet = await this.walletRepo.findOne({
      where: { employeeId },
      relations: ['employee'],
    });
    if (!wallet) throw new NotFoundException(`Wallet not found for employee ${employeeId}`);
    return wallet;
  }

  async getBalance(employeeId: string): Promise<{ balance: number; lockedBalance: number; available: number }> {
    const wallet = await this.getOrCreateWallet(employeeId);
    const available = Math.max(0, Number(wallet.balance) - Number(wallet.lockedBalance));
    return { balance: Number(wallet.balance), lockedBalance: Number(wallet.lockedBalance), available };
  }

  async getHistory(employeeId: string): Promise<TokenTransaction[]> {
    const wallet = await this.getOrCreateWallet(employeeId);
    return this.txRepo.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    });
  }

  async mint(employeeId: string, amount: number, reason: string, txRef?: string): Promise<TokenTransaction> {
    if (amount <= 0) throw new BadRequestException('Mint amount must be positive');
    const wallet = await this.getOrCreateWallet(employeeId);
    wallet.balance = Number(wallet.balance) + amount;
    await this.walletRepo.save(wallet);

    const record = this.txRepo.create({
      walletId: wallet.id,
      type: TokenTxType.MINT,
      amount,
      reason,
      txRef: txRef || null,
      balanceAfter: wallet.balance,
    });
    return this.txRepo.save(record);
  }

  async mintReward(employeeId: string, rewardKey: RewardKey, txRef?: string): Promise<TokenTransaction> {
    const amount = TOKEN_REWARDS[rewardKey];
    return this.mint(employeeId, amount, rewardKey, txRef);
  }

  async burn(employeeId: string, amount: number, reason: string): Promise<TokenTransaction> {
    const wallet = await this.getOrCreateWallet(employeeId);
    const available = Number(wallet.balance) - Number(wallet.lockedBalance);
    if (available < amount) throw new BadRequestException('Insufficient available balance to burn');
    wallet.balance = Number(wallet.balance) - amount;
    await this.walletRepo.save(wallet);

    const record = this.txRepo.create({
      walletId: wallet.id,
      type: TokenTxType.BURN,
      amount,
      reason,
      balanceAfter: wallet.balance,
    });
    return this.txRepo.save(record);
  }

  async transfer(fromEmployeeId: string, toEmployeeId: string, amount: number, memo = ''): Promise<{ from: TokenTransaction; to: TokenTransaction }> {
    const fromWallet = await this.getOrCreateWallet(fromEmployeeId);
    const toWallet = await this.getOrCreateWallet(toEmployeeId);
    const available = Number(fromWallet.balance) - Number(fromWallet.lockedBalance);
    if (available < amount) throw new BadRequestException('Insufficient available balance for transfer');

    fromWallet.balance = Number(fromWallet.balance) - amount;
    toWallet.balance = Number(toWallet.balance) + amount;
    await this.walletRepo.save([fromWallet, toWallet]);

    const outTx = this.txRepo.create({ walletId: fromWallet.id, type: TokenTxType.TRANSFER_OUT, amount, reason: memo || 'TRANSFER', txRef: toEmployeeId, balanceAfter: fromWallet.balance });
    const inTx  = this.txRepo.create({ walletId: toWallet.id,   type: TokenTxType.TRANSFER_IN,  amount, reason: memo || 'TRANSFER', txRef: fromEmployeeId, balanceAfter: toWallet.balance });
    await this.txRepo.save([outTx, inTx]);
    return { from: outTx, to: inTx };
  }

  async isFirstActivityThisMonth(employeeId: string): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(employeeId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await this.txRepo.count({
      where: { walletId: wallet.id },
    });
    if (count === 0) return true;
    const recent = await this.txRepo.findOne({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    });
    return !recent || recent.createdAt < monthStart;
  }

  async getLeaderboard(limit = 10): Promise<any[]> {
    return this.walletRepo.find({
      relations: ['employee'],
      order: { balance: 'DESC' },
      take: limit,
    });
  }

  async getTotalSupply(): Promise<number> {
    const result = await this.walletRepo
      .createQueryBuilder('w')
      .select('SUM(w.balance)', 'total')
      .getRawOne();
    return Number(result?.total || 0);
  }
}