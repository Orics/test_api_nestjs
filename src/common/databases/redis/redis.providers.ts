import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import { GENERAL_CONFIG } from '../../configs/general.config';
dotenv.config();

export const redisProviders = [
  {
    provide: 'REDIS_PROVIDER',
    useFactory: async () => {
      const client = createClient({
        url: GENERAL_CONFIG.REDIS_URI,
      });
      await client
        .connect()
        .then((connection) => {
          console.log('[Redis] connect success');
          return connection;
        })
        .catch((err) => {
          console.error('[Redis] connect failed', err.message);
        });
      return client;
    },
  },
];
