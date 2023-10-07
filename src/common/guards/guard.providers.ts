import { JwtAuthGuard } from './jwt.guard';
import { GoogleStrategy } from './strategies/google.stratery';
import { FacebookStrategy } from './strategies/facebook.stratery';

export const guardProviders = [
  {
    provide: 'AUTH_GUARD_PROVIDER',
    useClass: JwtAuthGuard,
  },
  {
    provide: 'GOOGLE_STRATERY_PROVIDER',
    useClass: GoogleStrategy,
  },
  {
    provide: 'FACEBOOK_STRATERY_PROVIDER',
    useClass: FacebookStrategy,
  },
];
