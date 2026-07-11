import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimCashbackDto {
  @ApiProperty({ description: 'UUID del adelanto por el que se reclama cashback (debe estar DISBURSED)' })
  @IsUUID()
  advanceRequestId: string;

  @ApiProperty({ description: 'UUID del empleado que reclama' })
  @IsUUID()
  employeeId: string;
}