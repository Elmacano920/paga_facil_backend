import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { ColumnNumericTransformer } from '../../../common/database/numeric-transformer';
import { Employee } from '../../employees/entities/employee.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  rif: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: 0.00,
  })
  payrollBalance: number;

  @OneToMany(() => Employee, (employee) => employee.company)
  employees: Employee[];
}
