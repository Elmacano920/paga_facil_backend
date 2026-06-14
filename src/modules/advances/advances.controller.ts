import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AdvancesService } from './advances.service';
import { CreateAdvanceDto } from './dto/create-advance.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('advances')
@Controller('advances')
@UseGuards(AuthGuard, RolesGuard)
export class AdvancesController {
  constructor(private readonly advancesService: AdvancesService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Solicitar un adelanto de nómina (Desembolso Instantáneo vía Pago Móvil)' })
  @ApiResponse({ status: 201, description: 'Adelanto aprobado, desembolsado y liquidado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Límites excedidos, fondos de empresa insuficientes o fallo en la red bancaria.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado.' })
  create(
    @Body() createAdvanceDto: CreateAdvanceDto,
    @CurrentUser() user: User,
  ) {
    if (user.role === UserRole.EMPLOYEE && createAdvanceDto.employeeId !== user.employeeId) {
      throw new ForbiddenException('No tienes permiso para solicitar un adelanto en nombre de otro empleado');
    }
    return this.advancesService.createAdvance(createAdvanceDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN)
  @ApiOperation({ summary: 'Listar todo el historial de adelantos (Superadmin ve todos, Admin de Empresa ve los suyos)' })
  @ApiResponse({ status: 200, description: 'Historial obtenido con éxito.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  findAll(@CurrentUser() user: User) {
    if (user.role === UserRole.COMPANY_ADMIN) {
      return this.advancesService.findAll(user.companyId || undefined);
    }
    return this.advancesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Obtener detalles de una solicitud de adelanto por ID' })
  @ApiParam({ name: 'id', description: 'ID UUID de la solicitud de adelanto' })
  @ApiResponse({ status: 200, description: 'Solicitud encontrada con sus datos de liquidación y Pago Móvil.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const advance = await this.advancesService.findOne(id);

    if (user.role === UserRole.EMPLOYEE && advance.employeeId !== user.employeeId) {
      throw new ForbiddenException('No tienes permiso para ver los detalles de esta solicitud de adelanto');
    }

    if (user.role === UserRole.COMPANY_ADMIN && advance.employee?.companyId !== user.companyId) {
      throw new ForbiddenException('No tienes permiso para ver solicitudes de adelanto de empleados de otra empresa');
    }

    return advance;
  }
}
