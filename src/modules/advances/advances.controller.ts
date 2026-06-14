import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AdvancesService } from './advances.service';
import { CreateAdvanceDto } from './dto/create-advance.dto';

@ApiTags('advances')
@Controller('advances')
export class AdvancesController {
  constructor(private readonly advancesService: AdvancesService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar un adelanto de nómina (Desembolso Instantáneo vía Pago Móvil)' })
  @ApiResponse({ status: 201, description: 'Adelanto aprobado, desembolsado y liquidado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Límites excedidos, fondos de empresa insuficientes o fallo en la red bancaria.' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado.' })
  create(@Body() createAdvanceDto: CreateAdvanceDto) {
    return this.advancesService.createAdvance(createAdvanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todo el historial de adelantos solicitados' })
  @ApiResponse({ status: 200, description: 'Historial obtenido con éxito.' })
  findAll() {
    return this.advancesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una solicitud de adelanto por ID' })
  @ApiParam({ name: 'id', description: 'ID UUID de la solicitud de adelanto' })
  @ApiResponse({ status: 200, description: 'Solicitud encontrada con sus datos de liquidación y Pago Móvil.' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.advancesService.findOne(id);
  }
}
