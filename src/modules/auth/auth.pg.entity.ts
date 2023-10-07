import { Entity, Column, ManyToOne } from 'typeorm';
import { PostgresBaseEntity } from '../../common/databases/postgresdb/postgresdb.entity';

@Entity({ name: 'tb_roles' })
export class Role extends PostgresBaseEntity {
  @Column({ type: 'varchar', nullable: true, length: 255 })
  name?: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  description?: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  activated?: boolean;

  @Column({ type: 'varchar', nullable: true })
  permissions?: string;
}

@Entity({ name: 'tb_accounts' })
export class Account extends PostgresBaseEntity {
  @Column({ type: 'varchar', nullable: true, length: 255, unique: true })
  email?: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  password?: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  googleId?: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  facebookId?: string;

  @Column({ type: 'uuid', nullable: true })
  roleId?: string;

  @ManyToOne(() => Role, { cascade: ['insert'] })
  role?: Role;

  @Column({ type: 'text', nullable: true })
  secretKey?: string;
}
