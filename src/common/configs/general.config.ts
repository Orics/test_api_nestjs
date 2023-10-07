import * as dotenv from 'dotenv';
dotenv.config();

export const GENERAL_CONFIG = {
  //
  APP_PORT: process.env.APP_PORT || 5000,
  APP_URL: process.env.APP_URL || `http://127.0.0.1:5000`,
  APP_PREFIX_ENDPOINT: 'api/v1',

  //
  CLIENT_URL: process.env.CLIENT_URL,

  // automatic seed data
  ENABLE_AUTO_SEED: true,

  // automatic seed data
  ENABLE_AUTO_GENERATE_DOCUMENT: true,
  ENABLE_OVERWRITE_DOCUMENT_FILE: true,

  // Cache config
  ENABLE_CACHE: false,
  CACHE_MILLISECONDS: 20000,

  // Public location
  PUBLIC_LOCATION: {
    FOLDER_PATH: 'public',
    ENPOINT: '/public',
  },

  // API document location
  DOCS_LOCATION: {
    FOLDER_PATH: 'docs',
    ENPOINT: '/docs',
  },

  // Access token config
  TOKEN_EXPIRE_IN: '1d',
  TOKEN_REFRESH_EXPIRE_IN: '1d',
  TOKEN_MODULUS_LENGTH: 2048, // minimum 2048

  // Session config
  SESSION_CLIENT_SECRET: 'asddsfgfgdfdfgdfgdfgd',

  POSTGRES: {
    HOST: process.env.POSTGRES_HOST || 'http://127.0.0.1',
    USERNAME: process.env.POSTGRES_USERNAME || 'postgres',
    PASSWORD: process.env.POSTGRES_PASSWORD || 'postgres',
    DATABASE: process.env.POSTGRES_DATABASE || 'postgres',
    SCHEMA: process.env.POSTGRES_SCHEMA,
    PORT: Number(process.env.POSTGRES_PORT) || 5432,
  },

  ELASTIC_URI: process.env.ELASTIC_URI || 'http://127.0.0.1:9200',

  REDIS_URI: process.env.REDIS_URI || 'redis://127.0.0.1:6379',

  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },

  FACEBOOK: {
    CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
  },
};
