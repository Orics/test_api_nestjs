import * as session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { GENERAL_CONFIG } from '../configs/general.config';
import * as dotenv from 'dotenv';
dotenv.config();

const client = createClient({ url: GENERAL_CONFIG.REDIS_URI });
const redisStore = new RedisStore({
  client: client,
  prefix: 'SID:',
});

export const SessionMiddleware = session({
  store: redisStore,
  secret: GENERAL_CONFIG.SESSION_CLIENT_SECRET,
  resave: false,
  saveUninitialized: false,
});
