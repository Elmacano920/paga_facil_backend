import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashbackClaim } from './entities/cashback-claim.entity';
import { AdvanceRequest } from '../advances/entities/advance-request.entity';
import { Transaction } from '../payouts/entities/transaction.entity';
import { CashbackService } from './cashback.service';
import { CashbackController } from './cashback.controller';
import { ReputationModule } from '../reputation/reputation.module';
import { TokensModule } from '../tokens/tokens.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CashbackClaim, AdvanceRequest, Transaction]),
    ReputationModule,
    TokensModule,
  ],
  controllers: [CashbackController],
  providers: [CashbackService],
  exports: [CashbackService],
})
export class CashbackModule {}