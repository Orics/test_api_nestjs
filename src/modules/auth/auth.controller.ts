import { Body, Controller, Post, Req, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { AccountService, AuthService } from './auth.pg.service';
import {
  AccountGetListRequestProps,
  AccountGetListResponseProps,
  AuthIdentity,
  AuthLoginRequestProps,
  AuthLoginResponseProps,
  AuthRegisterRequestProps,
  AuthRegisterResponseProps,
} from './auth.dto';
import {
  DuplidatedErrorResponse,
  InternalServerErrorResponse,
  InvalidErrorResponse,
} from '../../common/utils/errors.util';
import {
  ResponseListWithPagination,
  ResponseOne,
} from '../../common/utils/response.util';
import {
  GoogleAuth,
  FacebookAuth,
  UseAuthPermissions,
  Identity,
} from '../../common/guards/guard.decorator';
import { GENERAL_CONFIG } from '../../common/configs/general.config';
import { Filter, GetQuery } from '../../common/utils/request.util';
import { Account } from './auth.pg.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  @Post('login')
  async login(@Body() data: AuthLoginRequestProps) {
    const account = await this.accountService
      .getOneBy('email', data.email)
      .catch((err) => {
        throw new InternalServerErrorResponse(
          'Error check account by email',
          err,
        );
      });

    if (!account) {
      throw new InvalidErrorResponse([
        {
          name: 'email',
          value: data.email,
          message: 'Incorrect email',
        },
      ]);
    }
    const verified = await this.authService.verifyPassword(
      data.password,
      account.password,
    );
    if (!verified) {
      throw new InvalidErrorResponse([
        {
          name: 'password',
          value: data.password,
          message: 'Incorrect password',
        },
      ]);
    }
    const token = await this.authService.signToken(account);

    return new ResponseOne(
      {
        ...account,
        token,
      },
      AuthLoginResponseProps,
      200,
    );
  }

  @Post('register')
  async register(@Body() data: AuthRegisterRequestProps) {
    const existed = await this.accountService
      .getOneBy('email', data.email)
      .catch((err) => {
        throw new InternalServerErrorResponse(
          'Error check account by email',
          err,
        );
      });
    if (existed) {
      throw new DuplidatedErrorResponse('email');
    }

    const hash = await this.authService.hashPassword(data.password);
    const account = await this.accountService
      .create({
        ...data,
        password: hash,
      })
      .catch((err) => {
        throw new InternalServerErrorResponse('Error create account', err);
      });

    return new ResponseOne(account, AuthRegisterResponseProps, 200);
  }

  @Get('/accounts')
  @UseAuthPermissions([['ACCOUNT', 'GET_LIST']])
  async getAccountList(
    @Query() query: GetQuery<AccountGetListRequestProps>,
    @Identity() identity: AuthIdentity,
  ) {
    const filter: Filter<Account> = {
      type: 'AND',
      filters: [
        {
          property: 'createdBy',
          operator: 'eq',
          value: identity.id,
        },
      ],
    };
    const result = await this.accountService
      .getList(query, { filter })
      .catch((err) => {
        throw new InternalServerErrorResponse('Error get list accounts', err);
      });
    return new ResponseListWithPagination(
      result,
      AccountGetListResponseProps,
      200,
    );
  }

  @Get('google')
  @GoogleAuth()
  async redirectToGoogleAuth() {}

  @Get('google/callback')
  @GoogleAuth()
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const profile = req.account;
    if (profile) {
      let account = await this.accountService.getOneBy('email', profile.email);
      if (!profile.email || !account) {
        account = await this.accountService.create({
          googleId: profile.id,
          email: profile.email,
        });
      } else {
        account = await this.accountService.updateById(account.id, {
          googleId: profile.id,
        });
      }
      const token = await this.authService.signToken(account);
      return res.redirect(
        `${GENERAL_CONFIG.CLIENT_URL}/refesh-token?token=${token}`,
      );
    } else {
      throw new InternalServerErrorResponse('Error authenticating with google');
    }
  }

  @Get('facebook')
  @FacebookAuth()
  async redirectToFacebookAuth() {}

  @Get('facebook/callback')
  @FacebookAuth()
  async facebookCallback(@Req() req: any, @Res() res: Response) {
    const profile = req.account;
    if (profile) {
      let account = await this.accountService.getOneBy('email', profile.email);
      if (!profile.email || !account) {
        account = await this.accountService.create({
          facebookId: profile.id,
          email: profile.email,
        });
      } else {
        account = await this.accountService.updateById(account.id, {
          facebookId: profile.id,
        });
      }
      const token = await this.authService.signToken(account);
      return res.redirect(
        `${GENERAL_CONFIG.CLIENT_URL}/refesh-token?token=${token}`,
      );
    } else {
      throw new InternalServerErrorResponse(
        'Error authenticating with facebook',
      );
    }
  }
}
