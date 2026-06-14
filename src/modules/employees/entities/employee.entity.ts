import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { ColumnNumericTransformer } from '../../../common/database/numeric-transformer';
import { Company } from '../../companies/entities/company.entity';
import { AdvanceRequest } from '../../advances/entities/advance-request.entity';

@Entity('employees')
export class Employee extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  documentId: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 4 })
  bankCode: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  monthlySalary: number;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.employees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => AdvanceRequest, (advance) => advance.employee)
  advanceRequests: AdvanceRequest[];
}
