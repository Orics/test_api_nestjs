import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { GENERAL_CONFIG } from '../../configs/general.config';
// import { AuthService } from '../../modules/auth/auth.pg.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    // private authService: AuthService
    super({
      clientID: GENERAL_CONFIG.GOOGLE.CLIENT_ID,
      clientSecret: GENERAL_CONFIG.GOOGLE.CLIENT_SECRET,
      // callbackURL: `${GENERAL_CONFIG.APP_URL}/${GENERAL_CONFIG.APP_PREFIX_ENDPOINT}/auth/google/callback`,
      callbackURL: `http://localhost:5000/api/v1/auth/google/callback`,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user11 = {
      googleId: id,
      email: emails[0].value,
      fullname: `${name.givenName} ${name.familyName}`,
      avatarUrl: photos[0].value,
    };

    done(null, user11);
  }
}
