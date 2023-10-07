import { Entity, Column } from 'typeorm';
import { PostgresBaseEntity } from '../../common/databases/postgresdb/postgresdb.entity';

@Entity({ name: 'tb_tests' })
export class Test extends PostgresBaseEntity {
  @Column({ type: 'varchar', nullable: true, length: 255 })
  name?: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  description?: string;
}
