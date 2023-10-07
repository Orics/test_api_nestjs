import { Module } from '@nestjs/common';
import { elasticProviders } from './elastic.providers';

@Module({
  providers: [...elasticProviders],
  exports: [...elasticProviders],
})
export class ElasticModule {}
