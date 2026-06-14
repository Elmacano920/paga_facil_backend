import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { AdvanceRequest, AdvanceStatus } from '../advances/entities/advance-request.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmployeesService {
  private readonly fixedFee: number;

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(AdvanceRequest)
    private readonly advanceRepository: Repository<AdvanceRequest>,
    private readonly configService: ConfigService,
  ) {
    this.fixedFee = parseFloat(this.configService.get<string>('FIXED_FEE') || '2.00');
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeeRepository.create(createEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({ relations: ['company'] });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['company'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  calculateWorkedDaysInPeriod(date: Date): { workedDays: number; periodStart: Date; periodEnd: Date } {
    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    let workedDays = 0;
    let periodStart: Date;
    let periodEnd: Date;

    if (day <= 15) {
      workedDays = day;
      periodStart = new Date(year, month, 1, 0, 0, 0, 0);
      periodEnd = new Date(year, month, 15, 23, 59, 59, 999);
    } else {
      workedDays = day - 15;
      periodStart = new Date(year, month, 16, 0, 0, 0, 0);
      const lastDay = new Date(year, month + 1, 0).getDate();
      periodEnd = new Date(year, month, lastDay, 23, 59, 59, 999);
    }

    return { workedDays, periodStart, periodEnd };
  }

  async getPayrollAdvanceStatus(id: string, date: Date = new Date()): Promise<{
    employeeId: string;
    monthlySalary: number;
    dailySalary: number;
    workedDaysInFortnight: number;
    accumulatedSalary: number;
    payoutsInFortnight: number;
    fixedFee: number;
    availableQuota: number;
    period: { start: string; end: string };
  }> {
    const employee = await this.findOne(id);
    const { workedDays, periodStart, periodEnd } = this.calculateWorkedDaysInPeriod(date);

    const dailySalary = Number(employee.monthlySalary) / 30;
    const accumulatedSalary = dailySalary * workedDays;

    const advances = await this.advanceRepository.find({
      where: {
        employeeId: id,
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

    return {
      employeeId: employee.id,
      monthlySalary: Number(employee.monthlySalary),
      dailySalary: Number(dailySalary.toFixed(2)),
      workedDaysInFortnight: workedDays,
      accumulatedSalary: Number(accumulatedSalary.toFixed(2)),
      payoutsInFortnight: Number(payoutsInFortnight.toFixed(2)),
      fixedFee: this.fixedFee,
      availableQuota: Number(availableQuota.toFixed(2)),
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
    };
  }
}
