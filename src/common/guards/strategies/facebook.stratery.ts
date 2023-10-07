import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-facebook';
import { GENERAL_CONFIG } from '../../configs/general.config';
// import { AuthService } from '../../modules/auth/auth.pg.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    // private authService: AuthService
    console.log(GENERAL_CONFIG.FACEBOOK);
    super({
      clientID: GENERAL_CONFIG.FACEBOOK.CLIENT_ID,
      clientSecret: GENERAL_CONFIG.FACEBOOK.CLIENT_SECRET,
      // callbackURL: `${GENERAL_CONFIG.APP_URL}/${GENERAL_CONFIG.APP_PREFIX_ENDPOINT}/auth/google/callback`,
      callbackURL: `http://localhost:5000/api/v1/auth/facebook/callback`,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;
    const user = {
      email: emails[0].value,
    };

    done(null, user);
  }
}
