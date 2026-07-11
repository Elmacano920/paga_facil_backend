import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Company } from '../../companies/entities/company.entity';
import { AdvanceRequest } from '../../advances/entities/advance-request.entity';

export enum ReviewStatus {
  ACTIVE = 'ACTIVE',
  REMOVED = 'REMOVED',
}

@Entity('reviews')
export class Review extends BaseEntity {
  @Column({ type: 'uuid' })
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'uuid' })
  advanceRequestId: string;

  @ManyToOne(() => AdvanceRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advanceRequestId' })
  advanceRequest: AdvanceRequest;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'varchar', length: 500 })
  comment: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  helpful: number;

  @Column({ type: 'int', default: 0 })
  notHelpful: number;

  @Column({ type: 'simple-array', nullable: true })
  voters: string[];

  @Column({ type: 'boolean', default: true })
  verified: boolean;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.ACTIVE,
  })
  status: ReviewStatus;
}