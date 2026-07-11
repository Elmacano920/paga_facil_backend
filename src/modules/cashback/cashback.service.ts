import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashbackClaim } from './entities/cashback-claim.entity';
import { AdvanceRequest } from '../../modules/advances/entities/advance-request.entity';
import { Transaction, TransactionStatus } from '../../modules/payouts/entities/transaction.entity';
import { ReputationService } from '../../modules/reputation/reputation.service';
import { TokensService } from '../../modules/tokens/tokens.service';
import { EntityType } from '../../modules/reputation/entities/reputation-score.entity';
import { ClaimCashbackDto } from './dto/claim-cashback.dto';

const MIN_AMOUNT = 1.0;
const MAX_HOURS  = 48;

@Injectable()
export class CashbackService {
  constructor(
    @InjectRepository(CashbackClaim)
    private claimRepo: Repository<CashbackClaim>,
    @InjectRepository(AdvanceRequest)
    private advanceRepo: Repository<AdvanceRequest>,
    @InjectRepository(Transaction)
    private txRepo: Repository<Transaction>,
    private readonly reputationService: ReputationService,
    private readonly tokensService: TokensService,
  ) {}

  async claimCashback(dto: ClaimCashbackDto): Promise<any> {
    const conditions: { label: string; ok: boolean; detail?: string }[] = [];

    const advance = await this.advanceRepo.findOne({
      where: { id: dto.advanceRequestId, employeeId: dto.employeeId },
      relations: ['employee'],
    });
    if (!advance || advance.status !== ('DISBURSED' as any)) {
      conditions.push({ label: 'Adelanto DISBURSED', ok: false });
      throw new BadRequestException({ conditions, message: 'El adelanto no existe o no esta en estado DISBURSED.' });
    }
    conditions.push({ label: 'Adelanto DISBURSED', ok: true });

    const tx = await this.txRepo.findOne({ where: { advanceRequestId: advance.id } });
    if (!tx || tx.status !== TransactionStatus.SUCCESS) {
      conditions.push({ label: 'Transaccion SUCCESS', ok: false });
      throw new BadRequestException({ conditions, message: 'La transaccion bancaria no fue exitosa.' });
    }
    conditions.push({ label: 'Transaccion SUCCESS', ok: true });

    const settledAt    = tx.settledAt || tx.createdAt;
    const elapsedHours = (Date.now() - new Date(settledAt).getTime()) / 3_600_000;
    if (elapsedHours > MAX_HOURS) {
      conditions.push({ label: `Ventana ${MAX_HOURS}h`, ok: false, detail: `Han pasado ${elapsedHours.toFixed(1)}h` });
      throw new BadRequestException({ conditions, message: `El cashback expiro. Han pasado ${elapsedHours.toFixed(1)}h (maximo ${MAX_HOURS}h).` });
    }
    conditions.push({ label: `Ventana ${MAX_HOURS}h`, ok: true, detail: `${elapsedHours.toFixed(1)}h transcurridas` });

    const existing = await this.claimRepo.findOne({ where: { advanceRequestId: advance.id } });
    if (existing) {
      conditions.push({ label: 'Anti doble reclamo', ok: false });
      throw new ConflictException({ conditions, message: `Cashback ya reclamado el ${new Date(existing.claimedAt).toLocaleString('es-VE')}.` });
    }
    conditions.push({ label: 'Anti doble reclamo', ok: true });

    const amount = Number(advance.amountRequested);
    if (amount < MIN_AMOUNT) {
      conditions.push({ label: `Monto minimo $${MIN_AMOUNT}`, ok: false });
      throw new BadRequestException({ conditions, message: `Monto $${amount} esta por debajo del minimo $${MIN_AMOUNT}.` });
    }
    conditions.push({ label: `Monto minimo $${MIN_AMOUNT}`, ok: true });

    let repScore = await this.reputationService.getScore(dto.employeeId, EntityType.EMPLOYEE);
    if (!repScore) repScore = await this.reputationService.calculateEmployeeScore(dto.employeeId);

    const tier        = this.reputationService.getTier(repScore.score);
    const cashbackUSD = Math.round(amount * tier.rate * 100) / 100;
    const baseTokens  = 5;

    const isFirstMonth = await this.tokensService.isFirstActivityThisMonth(dto.employeeId);
    const bonusTokens  = isFirstMonth ? 25 : 0;
    const totalTokens  = baseTokens + bonusTokens;

    const claim = this.claimRepo.create({
      advanceRequestId: advance.id,
      employeeId:       dto.employeeId,
      amountRequested:  amount,
      cashbackUSD,
      tier:         tier.name,
      rate:         tier.rate,
      tokensEarned: totalTokens,
      bonusTokens,
      claimedAt:    new Date(),
    });
    await this.claimRepo.save(claim);

    await this.tokensService.mint(dto.employeeId, totalTokens, 'CASHBACK_CLAIMED', advance.id);
    await this.reputationService.calculateEmployeeScore(dto.employeeId);
    if (advance.employee?.companyId) {
      await this.reputationService.calculateCompanyScore(advance.employee.companyId);
    }

    const bonusMsg = bonusTokens > 0 ? ` (incluye ${bonusTokens} LTK bono primer uso mensual)` : '';
    return {
      success: true,
      message: `Cashback de $${cashbackUSD.toFixed(2)} aprobado! +${totalTokens} LTK${bonusMsg}`,
      conditions,
      cashbackUSD,
      tokensEarned: totalTokens,
      bonusTokens,
      tier: { name: tier.name, rate: `${(tier.rate * 100).toFixed(0)}%` },
      claim,
    };
  }

  async getClaimsForEmployee(employeeId: string): Promise<CashbackClaim[]> {
    return this.claimRepo.find({ where: { employeeId }, order: { claimedAt: 'DESC' } });
  }

  async getStats(): Promise<any> {
    const all = await this.claimRepo.find();
    const byTier: Record<string, { count: number; totalUSD: number; totalTokens: number }> = {};
    for (const c of all) {
      if (!byTier[c.tier]) byTier[c.tier] = { count: 0, totalUSD: 0, totalTokens: 0 };
      byTier[c.tier].count++;
      byTier[c.tier].totalUSD    += Number(c.cashbackUSD);
      byTier[c.tier].totalTokens += c.tokensEarned;
    }
    return {
      totalClaims: all.length,
      totalUSD:    all.reduce((s, c) => s + Number(c.cashbackUSD), 0),
      totalTokens: all.reduce((s, c) => s + c.tokensEarned, 0),
      byTier,
    };
  }
}