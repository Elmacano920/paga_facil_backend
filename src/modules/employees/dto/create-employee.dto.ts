import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsUUID, Length } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Primer nombre del empleado', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Apellido(s) del empleado', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Documento de identidad (Cédula/DNI)', example: 'V-12345678' })
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({ description: 'Número telefónico móvil para Pago Móvil', example: '04125555555' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Código del banco receptor (4 dígitos)', example: '0102' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  bankCode: string;

  @ApiProperty({ description: 'Salario mensual bruto del empleado', example: 1200.00 })
  @IsNumber()
  @Min(0)
  monthlySalary: number;

  @ApiProperty({ description: 'ID de la empresa B2B afiliada', example: 'fa80b679-b145-422c-a22d-327c570b5555' })
  @IsUUID()
  companyId: string;
}
