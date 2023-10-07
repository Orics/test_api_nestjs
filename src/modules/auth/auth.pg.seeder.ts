import { Inject, Injectable } from '@nestjs/common';
import { PostgresSeeder } from '../../common/databases/postgresdb/postgresdb.seeder';
import { Account, Role } from './auth.pg.entity';
import { RoleProvider, AccountProvider } from './auth.pg.providers';
import { AuthService } from './auth.pg.service';

@Injectable()
export class AuthSeeder extends PostgresSeeder {
  constructor(
    @Inject('ROLE_PG_PROVIDER') private roleProvider: RoleProvider,
    @Inject('ACCOUNT_PG_PROVIDER') private accountProvider: AccountProvider,
    private authService: AuthService,
  ) {
    super(roleProvider);
  }

  async seed() {
    const role = new Role();
    role.name = 'SupperAdmin';
    role.permissions = '*.*';

    const account = new Account();
    account.email = 'admin@gmail.com';
    account.password = await this.authService.hashPassword('123456');
    account.role = role;

    this.accountProvider.save(account);
  }
}
