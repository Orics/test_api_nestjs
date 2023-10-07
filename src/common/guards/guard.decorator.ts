import 'reflect-metadata';
import {
  ExecutionContext,
  SetMetadata,
  UseGuards,
  createParamDecorator,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  GUARD_PERMISSIONS_DECORATOR_KEY,
  PERMISSION_ACTION_MAP,
  PERMISSION_TARGET_MAP,
} from '../utils/constant.util';
import { JwtAuthGuard } from './jwt.guard';

export type PermissionKeys = [
  targetKey: keyof typeof PERMISSION_TARGET_MAP,
  actionKey?: keyof typeof PERMISSION_ACTION_MAP,
];

export type PermissionValues = [targetKey: number, actionKey?: number];

export const UseAuthPermissions = (
  permissons: PermissionKeys[],
): MethodDecorator => {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {
    UseGuards(JwtAuthGuard)(target, method, descriptor);
    SetMetadata(GUARD_PERMISSIONS_DECORATOR_KEY, permissons)(
      target,
      method,
      descriptor,
    );
  };
};

export const UseAuth = (): MethodDecorator => {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {
    UseGuards(JwtAuthGuard)(target, method, descriptor);
  };
};

export const Identity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.identity;
  },
);

export const GoogleAuth = (): MethodDecorator => {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {
    UseGuards(AuthGuard('google'))(target, method, descriptor);
  };
};

export const FacebookAuth = (): MethodDecorator => {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {
    UseGuards(AuthGuard('facebook'))(target, method, descriptor);
  };
};
