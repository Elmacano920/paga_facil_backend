import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from './modules/companies/companies.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AdvancesModule } from './modules/advances/advances.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { Company } from './modules/companies/entities/company.entity';
import { Employee } from './modules/employees/entities/employee.entity';
import { AdvanceRequest } from './modules/advances/entities/advance-request.entity';
import { Transaction } from './modules/payouts/entities/transaction.entity';
import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DATABASE_PORT', '5432'), 10),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'postgrespassword'),
        database: configService.get<string>('DATABASE_NAME', 'sueldo_al_dia'),
        entities: [Company, Employee, AdvanceRequest, Transaction],
        synchronize: configService.get<string>('DATABASE_SYNC') === 'true',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    CompaniesModule,
    EmployeesModule,
    AdvancesModule,
    PayoutsModule,
    TypeOrmModule.forFeature([Company, Employee]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
