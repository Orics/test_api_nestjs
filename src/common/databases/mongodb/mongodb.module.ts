import { Module } from '@nestjs/common';
import { mongoDBProviders } from './mongodb.providers';

@Module({
  providers: [...mongoDBProviders],
  exports: [...mongoDBProviders],
})
export class MongoDBModule {}
