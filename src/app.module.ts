import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { DatabaseModule } from './common/databases/database.module';
import { SessionMiddleware } from './common/middlewares/session.middleware';
import { StaticFileModule } from './common/static/static.module';
import { ApiDocumentModule } from './common/docs/docs.module';
import { AuthModule } from './modules/auth/auth.module';

import { TestModule } from './modules/test/test.module';

@Module({
  imports: [
    // default modules
    DatabaseModule,
    StaticFileModule,
    ApiDocumentModule,
    AuthModule,

    // custom modules
    TestModule,
  ],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
