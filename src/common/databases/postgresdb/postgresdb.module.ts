import { Module } from '@nestjs/common';
import { postgresDBProviders } from './postgresdb.providers';

@Module({
  providers: [...postgresDBProviders],
  exports: [...postgresDBProviders],
})
export class PostgresDBModule {}
