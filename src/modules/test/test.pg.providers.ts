import { DataSource, Repository } from 'typeorm';
import { Test } from './test.pg.entity';

export const testProviders = [
  {
    provide: 'TEST_PG_PROVIDER',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Test),
    inject: ['POSTGRES_PROVIDER'],
  },
];

export type TestProvider = Repository<Test>;
