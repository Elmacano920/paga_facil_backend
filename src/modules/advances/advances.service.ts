import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, In } from 'typeorm';
import { AdvanceRequest, AdvanceStatus } from './entities/advance-request.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Company } from '../companies/entities/company.entity';
import { Transaction, TransactionStatus } from '../payouts/entities/transaction.entity';
import { PayoutsService } from '../payouts/payouts.service';
import { EmployeesService } from '../employees/employees.service';
import { CreateAdvanceDto } from './dto/create-advance.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdvancesService {
  private readonly logger = new Logger(AdvancesService.name);
  private readonly fixedFee: number;

  constructor(
    @InjectRepository(AdvanceRequest)
    private readonly advanceRepository: Repository<AdvanceRequest>,
    private readonly employeesService: EmployeesService,
    private readonly payoutsService: PayoutsService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.fixedFee = parseFloat(this.configService.get<string>('FIXED_FEE') || '2.00');
  }

  async createAdvance(createAdvanceDto: CreateAdvanceDto): Promise<{
    success: boolean;
    advance: AdvanceRequest;
    transaction: Transaction;
  }> {
    const { employeeId, amountRequested } = createAdvanceDto;
    this.logger.log(`Procesando solicitud de adelanto para empleado ${employeeId} por ${amountRequested} USD`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const employee = await queryRunner.manager.findOne(Employee, {
        where: { id: employeeId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      const company = await queryRunner.manager.findOne(Company, {
        where: { id: employee.companyId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!company) {
        throw new NotFoundException(`Company for employee not found`);
      }

      employee.company = company;

      const { workedDays, periodStart, periodEnd } = this.employeesService.calculateWorkedDaysInPeriod(new Date());
      const dailySalary = Number(employee.monthlySalary) / 30;
      const accumulatedSalary = dailySalary * workedDays;

      const advances = await queryRunner.manager.find(AdvanceRequest, {
        where: {
          employeeId: employee.id,
          status: In([AdvanceStatus.APPROVED, AdvanceStatus.DISBURSED]),
          requestDate: Between(periodStart, periodEnd),
        },
      });

      const payoutsInFortnight = advances.reduce(
        (sum, adv) => sum + Number(adv.amountRequested) + Number(adv.fee),
        0,
      );

      const availableQuotaRaw = accumulatedSalary - payoutsInFortnight - this.fixedFee;
      const availableQuota = availableQuotaRaw > 0 ? availableQuotaRaw : 0;

      if (amountRequested > availableQuota) {
        throw new BadRequestException(
          `Cupo insuficiente. Monto solicitado: ${amountRequested} USD. Cupo disponible: ${availableQuota.toFixed(2)} USD (incluyendo comisión de ${this.fixedFee} USD).`
        );
      }

      if (Number(employee.company.payrollBalance) < amountRequested) {
        throw new BadRequestException(
          `La empresa ${employee.company.name} no cuenta con fondos suficientes en su balance de nómina para procesar este adelanto.`
        );
      }

      employee.company.payrollBalance = Number(employee.company.payrollBalance) - amountRequested;
      await queryRunner.manager.save(employee.company);

      const advance = queryRunner.manager.create(AdvanceRequest, {
        employeeId: employee.id,
        amountRequested,
        fee: this.fixedFee,
        status: AdvanceStatus.APPROVED,
        requestDate: new Date(),
      });
      const savedAdvance = await queryRunner.manager.save(advance);

      const transaction = queryRunner.manager.create(Transaction, {
        advanceRequestId: savedAdvance.id,
        status: TransactionStatus.PENDING,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      const payoutResult = await this.payoutsService.disburse(
        employee.bankCode,
        employee.phone,
        employee.documentId,
        amountRequested,
      );

      if (!payoutResult.success) {
        throw new Error(payoutResult.error || 'Fallo en la conexión con la red de Pago Móvil');
      }

      savedTransaction.status = TransactionStatus.SUCCESS;
      savedTransaction.pagoMovilRef = payoutResult.reference ?? null;
      savedTransaction.settledAt = new Date();
      const finalTransaction = await queryRunner.manager.save(savedTransaction);

      savedAdvance.status = AdvanceStatus.DISBURSED;
      const finalAdvance = await queryRunner.manager.save(savedAdvance);

      await queryRunner.commitTransaction();

      this.logger.log(`Adelanto ${finalAdvance.id} procesado exitosamente con ref ${finalTransaction.pagoMovilRef}`);

      return {
        success: true,
        advance: finalAdvance,
        transaction: finalTransaction,
      };

    } catch (error) {
      this.logger.error(`Error procesando adelanto, revirtiendo cambios: ${error.message}`);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`No se pudo procesar el adelanto: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(companyId?: string): Promise<AdvanceRequest[]> {
    const where = companyId ? { employee: { companyId } } : {};
    return this.advanceRepository.find({
      where,
      relations: ['employee', 'employee.company', 'transaction'],
      order: { requestDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AdvanceRequest> {
    const advance = await this.advanceRepository.findOne({
      where: { id },
      relations: ['employee', 'employee.company', 'transaction'],
    });
    if (!advance) {
      throw new NotFoundException(`AdvanceRequest with ID ${id} not found`);
    }
    return advance;
  }
}
