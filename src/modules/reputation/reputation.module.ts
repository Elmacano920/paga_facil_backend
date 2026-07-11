import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReputationScore } from './entities/reputation-score.entity';
import { Review } from '../reviews/entities/review.entity';
import { AdvanceRequest } from '../advances/entities/advance-request.entity';
import { CashbackClaim } from '../cashback/entities/cashback-claim.entity';
import { ReputationService } from './reputation.service';
import { ReputationController } from './reputation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReputationScore, Review, AdvanceRequest, CashbackClaim])],
  controllers: [ReputationController],
  providers: [ReputationService],
  exports: [ReputationService],
})
export class ReputationModule {}