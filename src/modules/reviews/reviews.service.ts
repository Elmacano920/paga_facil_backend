import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { AdvanceRequest } from '../advances/entities/advance-request.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { VoteReviewDto } from './dto/vote-review.dto';
import { TokensService } from '../tokens/tokens.service';

const COOLDOWN_HOURS = 24;

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(AdvanceRequest)
    private advanceRepo: Repository<AdvanceRequest>,
    private tokensService: TokensService,
  ) {}

  async publishReview(dto: CreateReviewDto): Promise<{ success: boolean; message: string; review?: Review }> {
    // Validation 1: Employee must have a DISBURSED advance with this company
    const advance = await this.advanceRepo.findOne({
      where: {
        id: dto.advanceRequestId,
        employeeId: dto.employeeId,
        status: 'DISBURSED' as any,
      },
    });
    if (!advance) throw new ForbiddenException('Debes tener un adelanto completado con esta empresa para dejar una reseña.');

    // Validation 2: This advance hasn't been reviewed before
    const alreadyReviewed = await this.reviewRepo.findOne({ where: { advanceRequestId: dto.advanceRequestId } });
    if (alreadyReviewed) throw new BadRequestException('Ya publicaste una reseña para este adelanto.');

    // Validation 3: 24h cooldown between reviews for the same company
    const recentReview = await this.reviewRepo
      .createQueryBuilder('r')
      .where('r.employeeId = :empId AND r.companyId = :compId', { empId: dto.employeeId, compId: dto.companyId })
      .orderBy('r.createdAt', 'DESC')
      .getOne();

    if (recentReview) {
      const hoursSince = (Date.now() - new Date(recentReview.createdAt).getTime()) / 3600000;
      if (hoursSince < COOLDOWN_HOURS) {
        throw new BadRequestException(`Debes esperar ${(COOLDOWN_HOURS - hoursSince).toFixed(1)}h más antes de reseñar esta empresa de nuevo.`);
      }
    }

    // Create the review
    const review = this.reviewRepo.create({
      employeeId: dto.employeeId,
      companyId:  dto.companyId,
      advanceRequestId: dto.advanceRequestId,
      rating:   dto.rating,
      comment:  dto.comment.trim(),
      tags:     dto.tags?.slice(0, 5) || [],
      voters:   [],
      verified: true,
      status:   ReviewStatus.ACTIVE,
    });
    const saved = await this.reviewRepo.save(review);

    // Reward tokens for publishing
    await this.tokensService.mintReward(dto.employeeId, 'REVIEW_PUBLISHED', saved.id);

    return {
      success: true,
      message: `Reseña publicada. +15 LTK acreditados.`,
      review: saved,
    };
  }

  async voteReview(reviewId: string, dto: VoteReviewDto): Promise<{ success: boolean; message: string; review?: Review }> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new BadRequestException('Reseña no encontrada.');
    if (review.employeeId === dto.voterEmployeeId) throw new BadRequestException('No puedes votar tu propia reseña.');
    if (review.voters?.includes(dto.voterEmployeeId)) throw new BadRequestException('Ya votaste esta reseña.');

    if (dto.isHelpful) {
      review.helpful = (review.helpful || 0) + 1;
      await this.tokensService.mintReward(review.employeeId, 'REVIEW_HELPFUL_VOTE', reviewId);
    } else {
      review.notHelpful = (review.notHelpful || 0) + 1;
    }
    review.voters = [...(review.voters || []), dto.voterEmployeeId];
    const saved = await this.reviewRepo.save(review);

    return {
      success: true,
      message: dto.isHelpful ? `Voto útil registrado. El autor recibe +3 LTK.` : 'Voto negativo registrado.',
      review: saved,
    };
  }

  async getReviewsForCompany(companyId: string): Promise<{ reviews: Review[]; ratingStats: any }> {
    const reviews = await this.reviewRepo.find({
      where: { companyId, status: ReviewStatus.ACTIVE },
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });

    const stats = this.calculateRatingStats(reviews);
    return { reviews, ratingStats: stats };
  }

  async getReviewsByEmployee(employeeId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { employeeId },
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });
  }

  private calculateRatingStats(reviews: Review[]) {
    if (reviews.length === 0) return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
    const now = Date.now();
    const DECAY = 30 * 24 * 60 * 60 * 1000;
    let ws = 0, wt = 0;
    const distribution = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const age = now - new Date(r.createdAt).getTime();
      const w = Math.exp(-Math.LN2 * age / DECAY);
      ws += r.rating * w; wt += w;
      distribution[r.rating - 1]++;
    }
    return {
      average: Math.round((wt > 0 ? ws / wt : 0) * 10) / 10,
      count: reviews.length,
      distribution,
    };
  }
}