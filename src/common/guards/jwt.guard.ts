import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../modules/auth/auth.pg.service';
import {
  GUARD_PERMISSIONS_DECORATOR_KEY,
  PERMISSION_ACTION_MAP,
  PERMISSION_TARGET_MAP,
} from '../utils/constant.util';
import {
  InternalServerErrorResponse,
  PermissionDeniedErrorResponse,
  UnauthorizedErrorResponse,
} from '../utils/errors.util';
import { PermissionKeys, PermissionValues } from './guard.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token = request.headers['authorization'] as string;
    if (token) {
      if (token.includes('Bearer ')) {
        token = token.replace('Bearer ', '');
      }
    } else {
      token = request.query.access_token as string;
    }

    if (!token) {
      throw new UnauthorizedErrorResponse();
    }

    const identity = await this.authService.verifyToken(token).catch((err) => {
      throw new InternalServerErrorResponse('Error verify access token', err);
    });

    if (!identity) {
      throw new UnauthorizedErrorResponse();
    }

    request.identity = identity;

    const permissionKeysList: PermissionKeys[] =
      this.reflector.getAllAndOverride<any[]>(GUARD_PERMISSIONS_DECORATOR_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!permissionKeysList) {
      return true;
    } else {
      if (!identity?.permissions) {
        throw new PermissionDeniedErrorResponse();
      }
    }

    const permissionValuesList: PermissionValues[] = permissionKeysList.map(
      (permissionKeys) => {
        const [targetKey, actionKey] = permissionKeys;
        return [
          PERMISSION_TARGET_MAP[targetKey],
          PERMISSION_ACTION_MAP[actionKey],
        ];
      },
    );

    const accepted = permissionValuesList.every(
      ([requiredTarget, requiredAction]) => {
        const [target, action] = identity.permissions.split('.');
        let isPassedTartget, isPassedAction;

        if (target === '*') {
          isPassedTartget = true;
        } else {
          const userTarget = parseInt(target);
          if (userTarget && (userTarget ^ requiredTarget) <= userTarget) {
            isPassedTartget = true;
          }
        }

        if (action === '*') {
          isPassedAction = true;
        } else {
          const userAction = parseInt(action);
          if (userAction && (userAction ^ requiredAction) <= userAction) {
            isPassedAction = true;
          }
        }

        return isPassedTartget && isPassedAction;
      },
    );

    if (!accepted) {
      throw new PermissionDeniedErrorResponse();
    }

    return true;
  }
}
