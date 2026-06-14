import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('companies')
@Controller('companies')
@UseGuards(AuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Registrar una nueva empresa B2B (Solo Superadmin)' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas las empresas B2B (Solo Superadmin)' })
  @ApiResponse({ status: 200, description: 'Listado obtenido con éxito.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Obtener detalles de una empresa por ID (Admin y Admin de la Empresa)' })
  @ApiParam({ name: 'id', description: 'ID UUID de la empresa' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId !== id) {
      throw new ForbiddenException('No tienes permiso para ver los detalles de esta empresa');
    }
    return this.companiesService.findOne(id);
  }

  @Post(':id/deposit')
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Depositar fondos de nómina a la cuenta de una empresa B2B' })
  @ApiParam({ name: 'id', description: 'ID UUID de la empresa' })
  @ApiResponse({ status: 200, description: 'Depósito registrado e incrementado con éxito.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  deposit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
    @CurrentUser() user: User,
  ) {
    if (user.role === UserRole.COMPANY_ADMIN && user.companyId !== id) {
      throw new ForbiddenException('No tienes permiso para depositar fondos en otra empresa');
    }
    return this.companiesService.depositPayroll(id, amount);
  }
}
