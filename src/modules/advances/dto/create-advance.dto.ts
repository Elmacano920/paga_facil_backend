import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateAdvanceDto {
  @ApiProperty({ description: 'ID de base de datos del empleado solicitante', example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'Monto a solicitar como adelanto', example: 150.00 })
  @IsNumber()
  @Min(1)
  amountRequested: number;
}
