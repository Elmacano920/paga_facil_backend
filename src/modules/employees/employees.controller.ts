import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('employees')
@Controller('employees')
@UseGuards(AuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Registrar un nuevo empleado afiliado (Admin y Admin de Empresa)' })
  @ApiResponse({ status: 201, description: 'Empleado registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentUser() user: User,
  ) {
    if (user.role === UserRole.COMPANY_ADMIN && createEmployeeDto.companyId !== user.companyId) {
      throw new ForbiddenException('No tienes permiso para registrar empleados en otra empresa');
    }
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Listar todos los empleados (Admin ve todos, Admin de Empresa ve los suyos)' })
  @ApiResponse({ status: 200, description: 'Listado obtenido con éxito.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  findAll(@CurrentUser() user: User) {
    if (user.role === UserRole.COMPANY_ADMIN) {
      return this.employeesService.findAll(user.companyId || undefined);
    }
    return this.employeesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Obtener información de un empleado por ID' })
  @ApiParam({ name: 'id', description: 'ID UUID del empleado' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    if (user.role === UserRole.EMPLOYEE && user.employeeId !== id) {
      throw new ForbiddenException('No tienes permiso para ver la información de otro empleado');
    }

    const employee = await this.employeesService.findOne(id);

    if (user.role === UserRole.COMPANY_ADMIN && employee.companyId !== user.companyId) {
      throw new ForbiddenException('No tienes permiso para ver la información de un empleado de otra empresa');
    }

    return employee;
  }

  @Get(':id/payroll-status')
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Calcular el salario acumulado quincenal y saldo disponible para adelanto' })
  @ApiParam({ name: 'id', description: 'ID UUID del empleado' })
  @ApiQuery({ name: 'date', required: false, description: 'Fecha para simular el cálculo (formato YYYY-MM-DD)', example: '2026-06-10' })
  @ApiResponse({ status: 200, description: 'Cálculo de cupo y acumulado completado.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado.' })
  async getPayrollStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Query('date') dateString?: string,
  ) {
    if (user.role === UserRole.EMPLOYEE && user.employeeId !== id) {
      throw new ForbiddenException('No tienes permiso para consultar el cupo de otro empleado');
    }

    const employee = await this.employeesService.findOne(id);

    if (user.role === UserRole.COMPANY_ADMIN && employee.companyId !== user.companyId) {
      throw new ForbiddenException('No tienes permiso para consultar el cupo de un empleado de otra empresa');
    }

    const date = dateString ? new Date(dateString) : new Date();
    return this.employeesService.getPayrollAdvanceStatus(id, date);
  }
}
