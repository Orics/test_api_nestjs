import { Module } from '@nestjs/common';
import { PostgresDBModule } from '../../common/databases/postgresdb/postgresdb.module';
import { GuardModule } from '../../common/guards/guard.module';
import { UploaderModule } from '../../common/uploaders/uploader.module';
import { TestService } from './test.pg.service';
import { testProviders } from './test.pg.providers';
import { TestController } from './test.controller';

@Module({
  imports: [PostgresDBModule, UploaderModule, GuardModule],
  providers: [...testProviders, TestService],
  controllers: [TestController],
})
export class TestModule {}
