import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvancesService } from './advances.service';
import { AdvancesController } from './advances.controller';
import { AdvanceRequest } from './entities/advance-request.entity';
import { EmployeesModule } from '../employees/employees.module';
import { PayoutsModule } from '../payouts/payouts.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdvanceRequest]),
    EmployeesModule,
    PayoutsModule,
    ConfigModule,
  ],
  controllers: [AdvancesController],
  providers: [AdvancesService],
  exports: [AdvancesService, TypeOrmModule],
})
export class AdvancesModule {}
