import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayoutsService } from './payouts.service';
import { Transaction } from './entities/transaction.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    ConfigModule,
  ],
  providers: [PayoutsService],
  exports: [PayoutsService, TypeOrmModule],
})
export class PayoutsModule {}
