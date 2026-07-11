import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Existing modules
import { CompaniesModule }  from './modules/companies/companies.module';
import { EmployeesModule }  from './modules/employees/employees.module';
import { AdvancesModule }   from './modules/advances/advances.module';
import { PayoutsModule }    from './modules/payouts/payouts.module';
import { AuthModule }       from './modules/auth/auth.module';
import { UsersModule }      from './modules/users/users.module';

// New modules
import { TokensModule }     from './modules/tokens/tokens.module';
import { ReputationModule } from './modules/reputation/reputation.module';
import { ReviewsModule }    from './modules/reviews/reviews.module';
import { CashbackModule }   from './modules/cashback/cashback.module';

// Entities
import { Company }          from './modules/companies/entities/company.entity';
import { Employee }         from './modules/employees/entities/employee.entity';
import { AdvanceRequest }   from './modules/advances/entities/advance-request.entity';
import { Transaction }      from './modules/payouts/entities/transaction.entity';
import { User }             from './modules/users/entities/user.entity';
import { Review }           from './modules/reviews/entities/review.entity';
import { ReputationScore }  from './modules/reputation/entities/reputation-score.entity';
import { CashbackClaim }    from './modules/cashback/entities/cashback-claim.entity';
import { LoyaltyWallet }    from './modules/tokens/entities/loyalty-wallet.entity';
import { TokenTransaction } from './modules/tokens/entities/token-transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DATABASE_HOST',     'localhost'),
        port:     config.get<number>('DATABASE_PORT',     5435),
        username: config.get<string>('DATABASE_USER',     'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'postgrespassword'),
        database: config.get<string>('DATABASE_NAME',     'paga_facil'),
        entities: [
          Company, Employee, AdvanceRequest, Transaction, User,
          Review, ReputationScore, CashbackClaim, LoyaltyWallet, TokenTransaction,
        ],
        synchronize: config.get<boolean>('DATABASE_SYNC', true),
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    // Existing
    CompaniesModule, EmployeesModule, AdvancesModule, PayoutsModule, AuthModule, UsersModule,
    // New
    TokensModule, ReputationModule, ReviewsModule, CashbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}