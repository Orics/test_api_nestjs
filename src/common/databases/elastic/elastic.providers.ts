import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import { GENERAL_CONFIG } from '../..//configs/general.config';
dotenv.config();

export const elasticProviders = [
  {
    provide: 'ELASTIC_PROVIDER',
    useFactory: async () => {
      const client = new Client({
        node: GENERAL_CONFIG.ELASTIC_URI,
      });
      await client
        .ping()
        .then((connection) => {
          console.log('[Elastic] connect success');
          return connection;
        })
        .catch((err) => {
          console.error('[Elastic] connect failed', err.message);
        });
      return client;
    },
  },
];

export type ElasticProvider = Client;
