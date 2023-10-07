import { Module } from '@nestjs/common';
import { PostgresDBModule } from './../../common/databases/postgresdb/postgresdb.module';
import { AccountService, AuthService, RoleService } from './auth.pg.service';
import { AuthController } from './auth.controller';
import { AuthSeeder } from './auth.pg.seeder';
import { authProviders } from './auth.pg.providers';

@Module({
  imports: [PostgresDBModule],
  providers: [
    AuthService,
    AccountService,
    RoleService,
    ...authProviders,
    AuthSeeder,
  ],
  controllers: [AuthController],
  exports: [AuthService, AccountService, RoleService, ...authProviders],
})
export class AuthModule {}
