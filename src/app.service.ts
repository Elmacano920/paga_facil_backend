import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './modules/companies/entities/company.entity';
import { Employee } from './modules/employees/entities/employee.entity';
import { UsersService } from './modules/users/users.service';
import { UserRole } from './modules/users/entities/user.entity';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly usersService: UsersService,
  ) { }

  getHello(): string {
    return 'paga_facil API is running!';
  }

  async onApplicationBootstrap() {
    this.logger.log('Verificando inicialización de base de datos (Seed)...');

    try {
      let polarDb = await this.companyRepository.findOne({ where: { rif: 'J-00000001-0' } });
      let juanDb = await this.employeeRepository.findOne({ where: { documentId: 'V-12345678' } });

      const companyCount = await this.companyRepository.count();
      if (companyCount === 0) {
        this.logger.log('Base de datos vacía. Iniciando inserción de datos de empresas/empleados (Seed)...');

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
        polarDb = savedCompanies[0];
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

        const savedEmployees = await this.employeeRepository.save([emp1, emp2, emp3, emp4]);
        juanDb = savedEmployees[0];
      }

      // 4. Verificar y Crear Usuarios de prueba vinculados
      const existingAdmin = await this.usersService.findByEmail('admin@pagafacil.com');
      if (!existingAdmin) {
        this.logger.log('Usuarios de prueba ausentes. Creando usuarios iniciales (Seed)...');

        // Superadmin global
        await this.usersService.create({
          email: 'admin@pagafacil.com',
          password: 'admin123',
          role: UserRole.ADMIN,
        });

        // Admin de Empresa Polar
        if (polarDb) {
          await this.usersService.create({
            email: 'admin@polar.com',
            password: 'password123',
            role: UserRole.COMPANY_ADMIN,
            companyId: polarDb.id,
          });
        }

        // Empleado Juan Pérez
        if (juanDb && polarDb) {
          await this.usersService.create({
            email: 'juan@polar.com',
            password: 'password123',
            role: UserRole.EMPLOYEE,
            employeeId: juanDb.id,
            companyId: polarDb.id,
          });
        }
      } else {
        this.logger.log('Usuarios de prueba ya existen. Saltando seed de usuarios.');
      }

      this.logger.log('Verificación de base de datos completada.');
    } catch (error) {
      this.logger.error(`Error al insertar datos de seed: ${error.message}`);
    }
  }
}
