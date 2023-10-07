import { DataSource, Repository } from 'typeorm';
import { Account, Role } from './auth.pg.entity';

export const authProviders = [
  {
    provide: 'ROLE_PG_PROVIDER',
    useFactory: (dataSource: DataSource) => dataSource?.getRepository(Role),
    inject: ['POSTGRES_PROVIDER'],
  },
  {
    provide: 'ACCOUNT_PG_PROVIDER',
    useFactory: (dataSource: DataSource) => dataSource?.getRepository(Account),
    inject: ['POSTGRES_PROVIDER'],
  },
];

export type RoleProvider = Repository<Role>;
export type AccountProvider = Repository<Account>;
