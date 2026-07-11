import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ReputationService } from './reputation.service';
import { EntityType } from './entities/reputation-score.entity';

@ApiTags('Reputacion')
@Controller('reputation')
export class ReputationController {
  constructor(private readonly reputationService: ReputationService) {}

  @Get('company/:id')
  @ApiOperation({ summary: 'Obtener score de reputación de una empresa' })
  @ApiParam({ name: 'id', description: 'UUID de la empresa' })
  @ApiResponse({ status: 200, description: 'Score + desglose + tier + badge' })
  async getCompanyScore(@Param('id') id: string) {
    const score = await this.reputationService.calculateCompanyScore(id);
    const badge = this.reputationService.getScoreBadge(score.score);
    return { ...score, badge };
  }

  @Get('employee/:id')
  @ApiOperation({ summary: 'Obtener score de reputación de un empleado' })
  @ApiParam({ name: 'id', description: 'UUID del empleado' })
  @ApiResponse({ status: 200, description: 'Score + desglose + tier + badge' })
  async getEmployeeScore(@Param('id') id: string) {
    const score = await this.reputationService.calculateEmployeeScore(id);
    const badge = this.reputationService.getScoreBadge(score.score);
    return { ...score, badge };
  }

  @Post('recalculate/company/:id')
  @ApiOperation({ summary: 'Forzar recálculo del score de una empresa' })
  recalculateCompany(@Param('id') id: string) {
    return this.reputationService.calculateCompanyScore(id);
  }

  @Post('recalculate/employee/:id')
  @ApiOperation({ summary: 'Forzar recálculo del score de un empleado' })
  recalculateEmployee(@Param('id') id: string) {
    return this.reputationService.calculateEmployeeScore(id);
  }

  @Get('tiers')
  @ApiOperation({ summary: 'Listar todos los tiers de reputación y sus tasas de cashback' })
  getTiers() {
    return this.reputationService.getAllTiers();
  }
}