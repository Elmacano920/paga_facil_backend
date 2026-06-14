import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Nombre comercial/legal de la empresa', example: 'Empresas Polar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Identificación fiscal de la empresa (RIF/NIT)', example: 'J-12345678-9' })
  @IsString()
  @IsNotEmpty()
  rif: string;

  @ApiProperty({ description: 'Balance inicial cargado para fondos de nómina', example: 5000.00 })
  @IsNumber()
  @Min(0)
  payrollBalance: number;
}
