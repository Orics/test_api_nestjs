import { Inject, Injectable } from '@nestjs/common';
import { PostgresSeeder } from '../../common/databases/postgresdb/postgresdb.seeder';
import { TestProvider } from './test.pg.providers';
import { Test } from './test.pg.entity';

@Injectable()
export class TestSeeder extends PostgresSeeder {
  constructor(@Inject('TEST_PG_PROVIDER') private testProvider: TestProvider) {
    super(testProvider);
  }

  seed() {
    // TODO
  }
}
