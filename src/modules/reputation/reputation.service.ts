import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReputationScore, EntityType, ReputationTier } from './entities/reputation-score.entity';
import { Review } from '../../modules/reviews/entities/review.entity';
import { AdvanceRequest } from '../../modules/advances/entities/advance-request.entity';
import { CashbackClaim } from '../../modules/cashback/entities/cashback-claim.entity';

const TIERS: { name: ReputationTier; min: number; max: number; rate: number }[] = [
  { name: ReputationTier.BRONCE,  min: 0,  max: 24,  rate: 0.02 },
  { name: ReputationTier.PLATA,   min: 25, max: 49,  rate: 0.05 },
  { name: ReputationTier.ORO,     min: 50, max: 74,  rate: 0.08 },
  { name: ReputationTier.PLATINO, min: 75, max: 89,  rate: 0.12 },
  { name: ReputationTier.ELITE,   min: 90, max: 100, rate: 0.15 },
];

@Injectable()
export class ReputationService {
  constructor(
    @InjectRepository(ReputationScore)
    private scoreRepo: Repository<ReputationScore>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(AdvanceRequest)
    private advanceRepo: Repository<AdvanceRequest>,
    @InjectRepository(CashbackClaim)
    private cashbackRepo: Repository<CashbackClaim>,
  ) {}

  getTier(score: number) {
    return TIERS.find(t => score >= t.min && score <= t.max) || TIERS[0];
  }

  private clamp(v: number) { return Math.max(0, Math.min(100, v)); }
  private normalize(v: number, max: number) { return max === 0 ? 0 : this.clamp((v / max) * 100); }

  async calculateCompanyScore(companyId: string): Promise<ReputationScore> {
    const reviews  = await this.reviewRepo.find({ where: { companyId } });
    const advances = await this.advanceRepo.find({ where: { employee: { companyId } }, relations: ['employee'] });
    const claims   = await this.cashbackRepo.find({ where: { employee: { companyId } }, relations: ['employee'] });

    let reviewScore = 50; let reviewWeight = 0.10;
    if (reviews.length > 0) {
      const DECAY = 30 * 24 * 60 * 60 * 1000;
      let ws = 0, wt = 0;
      for (const r of reviews) {
        const w = Math.exp(-Math.LN2 * (Date.now() - new Date(r.createdAt).getTime()) / DECAY);
        ws += r.rating * w; wt += w;
      }
      reviewScore = ((wt > 0 ? ws / wt : 1) - 1) / 4 * 100;
      reviewWeight = 0.40;
    }

    const txScore = this.normalize(advances.length, 100);
    const sorted  = [...advances].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const ageDays = sorted[0] ? (Date.now() - new Date(sorted[0].createdAt).getTime()) / 86400000 : 0;
    const ageScore     = this.normalize(ageDays, 365);
    const cashbackRate = advances.length > 0 ? (claims.length / advances.length) * 100 : 50;
    const disbursed    = advances.filter(a => a.status === ('DISBURSED' as any)).length;
    const disputeScore = advances.length > 0 ? (disbursed / advances.length) * 100 : 70;

    const score = this.clamp(Math.round(
      reviewScore * reviewWeight + txScore * 0.20 + ageScore * 0.15 + cashbackRate * 0.15 + disputeScore * 0.10,
    ));
    const tier = this.getTier(score);
    const breakdown = {
      reviews:      { score: Math.round(reviewScore),  weight: reviewWeight, contribution: Math.round(reviewScore  * reviewWeight) },
      transactions: { score: Math.round(txScore),      weight: 0.20,         contribution: Math.round(txScore      * 0.20) },
      longevity:    { score: Math.round(ageScore),     weight: 0.15,         contribution: Math.round(ageScore     * 0.15) },
      cashbacks:    { score: Math.round(cashbackRate), weight: 0.15,         contribution: Math.round(cashbackRate * 0.15) },
      disputes:     { score: Math.round(disputeScore), weight: 0.10,         contribution: Math.round(disputeScore * 0.10) },
    };
    return this.upsertScore(companyId, EntityType.COMPANY, score, tier.name, breakdown);
  }

  async calculateEmployeeScore(employeeId: string): Promise<ReputationScore> {
    const reviews  = await this.reviewRepo.find({ where: { employeeId } });
    const advances = await this.advanceRepo.find({ where: { employeeId } });
    const claims   = await this.cashbackRepo.find({ where: { employeeId } });

    const reviewCountScore = this.normalize(reviews.length, 20);
    const totalVolume      = advances.reduce((s, a) => s + Number(a.amountRequested), 0);
    const volumeScore      = this.normalize(totalVolume, 5000);
    const sorted           = [...advances].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const ageDays          = sorted[0] ? (Date.now() - new Date(sorted[0].createdAt).getTime()) / 86400000 : 0;
    const ageScore         = this.normalize(ageDays, 365);
    const totalHelpful     = reviews.reduce((s, r) => s + (r.helpful || 0), 0);
    const totalVotes       = reviews.reduce((s, r) => s + (r.helpful || 0) + (r.notHelpful || 0), 0);
    const helpfulRatio     = totalVotes > 0 ? (totalHelpful / totalVotes) * 100 : 50;
    const claimRate        = advances.length > 0 ? (claims.length / advances.length) * 100 : 70;

    const score = this.clamp(Math.round(
      reviewCountScore * 0.30 + volumeScore * 0.25 + ageScore * 0.20 + helpfulRatio * 0.15 + claimRate * 0.10,
    ));
    const tier = this.getTier(score);
    const breakdown = {
      reviews:     { score: Math.round(reviewCountScore), weight: 0.30, contribution: Math.round(reviewCountScore * 0.30) },
      volume:      { score: Math.round(volumeScore),      weight: 0.25, contribution: Math.round(volumeScore      * 0.25) },
      longevity:   { score: Math.round(ageScore),         weight: 0.20, contribution: Math.round(ageScore         * 0.20) },
      helpfulness: { score: Math.round(helpfulRatio),     weight: 0.15, contribution: Math.round(helpfulRatio     * 0.15) },
      cashbacks:   { score: Math.round(claimRate),        weight: 0.10, contribution: Math.round(claimRate        * 0.10) },
    };
    return this.upsertScore(employeeId, EntityType.EMPLOYEE, score, tier.name, breakdown);
  }

  private async upsertScore(entityId: string, entityType: EntityType, score: number, tier: ReputationTier, breakdown: Record<string, any>): Promise<ReputationScore> {
    let record = await this.scoreRepo.findOne({ where: { entityId, entityType } });
    if (record) {
      record.score = score; record.tier = tier; record.breakdown = breakdown; record.lastUpdated = new Date();
    } else {
      record = this.scoreRepo.create({ entityId, entityType, score, tier, breakdown, lastUpdated: new Date() });
    }
    return this.scoreRepo.save(record);
  }

  async getScore(entityId: string, entityType: EntityType): Promise<ReputationScore | null> {
    return this.scoreRepo.findOne({ where: { entityId, entityType } });
  }

  getScoreBadge(score: number) {
    if (score >= 90) return { label: 'Elite',   color: '#a78bfa', emoji: 'E', cashbackRate: '15%' };
    if (score >= 75) return { label: 'Platino', color: '#E5E4E2', emoji: 'P', cashbackRate: '12%' };
    if (score >= 50) return { label: 'Oro',     color: '#FFD700', emoji: 'O', cashbackRate: '8%'  };
    if (score >= 25) return { label: 'Plata',   color: '#C0C0C0', emoji: 'S', cashbackRate: '5%'  };
    return               { label: 'Bronce',   color: '#cd7f32', emoji: 'B', cashbackRate: '2%'  };
  }

  getAllTiers() { return TIERS; }
}