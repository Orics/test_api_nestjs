import { Module } from '@nestjs/common';
import { guardProviders } from './guard.providers';
import { AuthModule } from '../../modules/auth/auth.module';
import { AuthService } from '../../modules/auth/auth.pg.service';

@Module({
  imports: [AuthModule],
  providers: [...guardProviders, AuthService],
  exports: [...guardProviders, AuthService],
})
export class GuardModule {}
