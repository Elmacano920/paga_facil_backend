import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { AdvanceRequest } from '../advances/entities/advance-request.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review, AdvanceRequest]), TokensModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}