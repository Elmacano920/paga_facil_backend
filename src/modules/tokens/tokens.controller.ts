import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TokensService } from './tokens.service';

class TransferDto {
  toEmployeeId: string;
  amount: number;
  memo?: string;
}

@ApiTags('Tokens LTK')
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('wallet/:employeeId')
  @ApiOperation({ summary: 'Consultar saldo LTK de un empleado' })
  @ApiParam({ name: 'employeeId', description: 'UUID del empleado' })
  @ApiResponse({ status: 200, description: 'Saldo disponible, bloqueado y total' })
  getWallet(@Param('employeeId') employeeId: string) {
    return this.tokensService.getBalance(employeeId);
  }

  @Get('history/:employeeId')
  @ApiOperation({ summary: 'Historial de movimientos LTK del empleado' })
  @ApiParam({ name: 'employeeId', description: 'UUID del empleado' })
  getHistory(@Param('employeeId') employeeId: string) {
    return this.tokensService.getHistory(employeeId);
  }

  @Post('transfer/:fromEmployeeId')
  @ApiOperation({ summary: 'Transferir LTK entre empleados' })
  @ApiParam({ name: 'fromEmployeeId', description: 'UUID del emisor' })
  transfer(@Param('fromEmployeeId') fromEmployeeId: string, @Body() dto: TransferDto) {
    return this.tokensService.transfer(fromEmployeeId, dto.toEmployeeId, dto.amount, dto.memo);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Ranking de empleados por saldo LTK' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de resultados (default 10)' })
  getLeaderboard(@Query('limit') limit?: number) {
    return this.tokensService.getLeaderboard(limit ? Number(limit) : 10);
  }

  @Get('supply')
  @ApiOperation({ summary: 'Supply total de tokens LTK en circulación' })
  async getTotalSupply() {
    const total = await this.tokensService.getTotalSupply();
    return { totalSupply: total, symbol: 'LTK' };
  }
}