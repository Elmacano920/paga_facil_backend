import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CashbackService } from './cashback.service';
import { ClaimCashbackDto } from './dto/claim-cashback.dto';

@ApiTags('Cashback')
@Controller('cashback')
export class CashbackController {
  constructor(private readonly cashbackService: CashbackService) {}

  @Post('claim')
  @ApiOperation({ summary: 'Reclamar cashback por un adelanto completado (5 validaciones automáticas)' })
  @ApiResponse({ status: 201, description: 'Cashback aprobado + LTK acreditados' })
  @ApiResponse({ status: 400, description: 'Alguna de las 5 condiciones falló' })
  @ApiResponse({ status: 409, description: 'Cashback ya reclamado para este adelanto' })
  claimCashback(@Body() dto: ClaimCashbackDto) {
    return this.cashbackService.claimCashback(dto);
  }

  @Get('employee/:id')
  @ApiOperation({ summary: 'Historial de cashbacks de un empleado' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  getEmployeeClaims(@Param('id') id: string) {
    return this.cashbackService.getClaimsForEmployee(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas globales de cashback por tier' })
  getStats() {
    return this.cashbackService.getStats();
  }
}