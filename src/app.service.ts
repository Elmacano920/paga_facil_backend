import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './modules/companies/entities/company.entity';
import { Employee } from './modules/employees/entities/employee.entity';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) { }

  getHello(): string {
    return 'paga_facil API is running!';
  }

  async onApplicationBootstrap() {
    this.logger.log('Verificando inicialización de base de datos (Seed)...');

    try {
      const companyCount = await this.companyRepository.count();
      if (companyCount > 0) {
        this.logger.log('Base de datos ya cuenta con registros. Saltando seed.');
        return;
      }

      this.logger.log('Base de datos vacía. Iniciando inserción de datos iniciales (Seed)...');

      // 1. Crear Empresas B2B
      const polar = this.companyRepository.create({
        name: 'Empresa Polar',
        rif: 'J-00000001-0',
        payrollBalance: 10000.00,
      });

      const mercantil = this.companyRepository.create({
        name: 'Mercantil Banco',
        rif: 'J-00000002-0',
        payrollBalance: 25000.00,
      });

      const sueldoAlDia = this.companyRepository.create({
        name: 'SueldoAlDía S.A.',
        rif: 'J-00000003-0',
        payrollBalance: 5000.00,
      });

      const savedCompanies = await this.companyRepository.save([polar, mercantil, sueldoAlDia]);
      const polarDb = savedCompanies[0];
      const mercantilDb = savedCompanies[1];

      // 2. Crear Empleados para Empresa Polar
      const emp1 = this.employeeRepository.create({
        firstName: 'Juan',
        lastName: 'Pérez',
        documentId: 'V-12345678',
        phone: '04125555555',
        bankCode: '0102',
        monthlySalary: 1200.00,
        companyId: polarDb.id,
      });

      const emp2 = this.employeeRepository.create({
        firstName: 'María',
        lastName: 'Rodríguez',
        documentId: 'V-87654321',
        phone: '04146666666',
        bankCode: '0105',
        monthlySalary: 1800.00,
        companyId: polarDb.id,
      });

      // 3. Crear Empleados para Mercantil Banco
      const emp3 = this.employeeRepository.create({
        firstName: 'Carlos',
        lastName: 'Mendoza',
        documentId: 'V-11223344',
        phone: '04167777777',
        bankCode: '0108',
        monthlySalary: 2500.00,
        companyId: mercantilDb.id,
      });

      const emp4 = this.employeeRepository.create({
        firstName: 'Ana',
        lastName: 'Gómez',
        documentId: 'V-44332211',
        phone: '04248888888',
        bankCode: '0102',
        monthlySalary: 3000.00,
        companyId: mercantilDb.id,
      });

      await this.employeeRepository.save([emp1, emp2, emp3, emp4]);
      this.logger.log('Datos iniciales inyectados exitosamente (Seed completado).');
    } catch (error) {
      this.logger.error(`Error al insertar datos de seed: ${error.message}`);
    }
  }
}
