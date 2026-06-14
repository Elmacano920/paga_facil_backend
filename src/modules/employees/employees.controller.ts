import { Controller, Get, Post, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo empleado afiliado' })
  @ApiResponse({ status: 201, description: 'Empleado registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los empleados registrados' })
  @ApiResponse({ status: 200, description: 'Listado obtenido con éxito.' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener información de un empleado por ID' })
  @ApiParam({ name: 'id', description: 'ID UUID del empleado' })
  @ApiResponse({ status: 200, description: 'Empleado encontrado.' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.findOne(id);
  }

  @Get(':id/payroll-status')
  @ApiOperation({ summary: 'Calcular el salario acumulado quincenal y saldo disponible para adelanto' })
  @ApiParam({ name: 'id', description: 'ID UUID del empleado' })
  @ApiQuery({ name: 'date', required: false, description: 'Fecha para simular el cálculo (formato YYYY-MM-DD)', example: '2026-06-10' })
  @ApiResponse({ status: 200, description: 'Cálculo de cupo y acumulado completado.' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado.' })
  getPayrollStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') dateString?: string,
  ) {
    const date = dateString ? new Date(dateString) : new Date();
    return this.employeesService.getPayrollAdvanceStatus(id, date);
  }
}
