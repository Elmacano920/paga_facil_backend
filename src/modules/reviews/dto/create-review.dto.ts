import { IsUUID, IsInt, Min, Max, IsString, MinLength, MaxLength, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'UUID del empleado que escribe la reseña' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'UUID de la empresa reseñada' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ description: 'UUID del adelanto asociado (debe estar DISBURSED)' })
  @IsUUID()
  advanceRequestId: string;

  @ApiProperty({ description: 'Calificación de 1 a 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Comentario (mínimo 10, máximo 500 caracteres)', minLength: 10, maxLength: 500 })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  comment: string;

  @ApiPropertyOptional({ description: 'Tags opcionales (máximo 5)', type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];
}