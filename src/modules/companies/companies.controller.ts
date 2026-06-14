import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva empresa B2B' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las empresas B2B registradas' })
  @ApiResponse({ status: 200, description: 'Listado obtenido con éxito.' })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una empresa por ID' })
  @ApiParam({ name: 'id', description: 'ID UUID de la empresa' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada.' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.findOne(id);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Depositar fondos de nómina a la cuenta de una empresa B2B' })
  @ApiParam({ name: 'id', description: 'ID UUID de la empresa' })
  @ApiResponse({ status: 200, description: 'Depósito registrado e incrementado con éxito.' })
  deposit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
  ) {
    return this.companiesService.depositPayroll(id, amount);
  }
}
