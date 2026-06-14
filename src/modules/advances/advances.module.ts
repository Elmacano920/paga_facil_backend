import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvancesService } from './advances.service';
import { AdvancesController } from './advances.controller';
import { AdvanceRequest } from './entities/advance-request.entity';
import { EmployeesModule } from '../employees/employees.module';
import { PayoutsModule } from '../payouts/payouts.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdvanceRequest]),
    EmployeesModule,
    PayoutsModule,
    ConfigModule,
    AuthModule,
  ],
  controllers: [AdvancesController],
  providers: [AdvancesService],
  exports: [AdvancesService, TypeOrmModule],
})
export class AdvancesModule {}
