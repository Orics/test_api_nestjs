import { GENERAL_CONFIG } from '../../configs/general.config';
import { Repository } from 'typeorm';

export abstract class PostgresSeeder {
  constructor(provider: Repository<any>) {
    if (GENERAL_CONFIG.ENABLE_AUTO_SEED) {
      provider.count({ withDeleted: true }).then((count) => {
        if (count == 0) {
          this.seed();
        }
      });
    }
  }

  abstract seed();
}
