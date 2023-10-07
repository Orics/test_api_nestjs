import { createConnection, DataSource } from 'typeorm';
import { GENERAL_CONFIG } from '../../configs/general.config';
import * as dotenv from 'dotenv';
dotenv.config();

export const postgresDBProviders = [
  {
    provide: 'POSTGRES_PROVIDER',
    useFactory: async () => {
      const connection = await createConnection({
        type: 'postgres',
        host: GENERAL_CONFIG.POSTGRES.HOST,
        port: GENERAL_CONFIG.POSTGRES.PORT,
        username: GENERAL_CONFIG.POSTGRES.USERNAME,
        password: GENERAL_CONFIG.POSTGRES.PASSWORD,
        database: GENERAL_CONFIG.POSTGRES.DATABASE,
        schema: GENERAL_CONFIG.POSTGRES.SCHEMA,
        entities: [__dirname + '/../../../modules/**/*.pg.entity{.ts,.js}'],
        synchronize: true,
        cache: GENERAL_CONFIG.ENABLE_CACHE
          ? {
              type: 'redis',
              options: {
                url: GENERAL_CONFIG.REDIS_URI,
              },
              alwaysEnabled: true,
              duration: GENERAL_CONFIG.CACHE_MILLISECONDS,
              ignoreErrors: true,
            }
          : false,
      })
        .then((dataSource) => {
          console.log('[Postgresdb] connect success');
          return dataSource;
        })
        .catch((err) => {
          console.error('[Postgresdb] connect failed', err.message);
        });
      return connection;
    },
  },
];

export type PostgresdbProvider = DataSource;
