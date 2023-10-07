import { Module } from '@nestjs/common';
import { PostgresDBModule } from './postgresdb/postgresdb.module';
import { MongoDBModule } from './mongodb/mongodb.module';
import { RedisModule } from './redis/redis.module';
import { ElasticModule } from './elastic/elastic.module';

@Module({
  imports: [MongoDBModule, PostgresDBModule, RedisModule, ElasticModule],
  exports: [MongoDBModule, PostgresDBModule, RedisModule, ElasticModule],
})
export class DatabaseModule {}
