import { IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteReviewDto {
  @ApiProperty({ description: 'UUID del empleado que vota' })
  @IsUUID()
  voterEmployeeId: string;

  @ApiProperty({ description: 'true = útil, false = no útil' })
  @IsBoolean()
  isHelpful: boolean;
}