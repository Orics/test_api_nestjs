import {
  IsEmail,
  Length,
  IsStrongPassword,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Account, Role } from './auth.pg.entity';

export class AuthLoginRequestProps {
  @IsEmail()
  @Length(1, 255)
  email: string = undefined;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  @Length(6, 20)
  password!: undefined;
}

export class AuthLoginResponseProps implements Partial<Account> {
  id?: string = undefined;

  email: string = undefined;

  token?: string = undefined;
}

export class AuthRegisterRequestProps implements Partial<Account> {
  @IsEmail()
  @Length(1, 255)
  email: string = undefined;

  @IsStrongPassword({
    minLength: 6,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  @Length(6, 20)
  password: string = undefined;

  @IsUUID()
  roleId?: string = undefined;
}

export class AuthRegisterResponseProps implements Partial<Account> {
  email: string = undefined;

  roleId?: string = undefined;

  createdAt?: Date = undefined;

  createdBy?: string = undefined;

  updatedAt?: Date = undefined;

  updatedBy?: string = undefined;
}

export class AuthIdentity {
  id: string = undefined;

  email: string = undefined;

  exp: number = undefined;

  iat: number = undefined;

  permissions?: string = undefined;
}

export class AccountGetListRequestProps implements Partial<Account> {
  id?: string = undefined;

  email?: string = undefined;

  createdAt?: Date = undefined;
}

export class AccountGetListResponseProps implements Partial<Account> {
  id?: string = undefined;

  email?: string = undefined;

  createdAt?: Date = undefined;

  createdBy?: string = undefined;

  updatedAt?: Date = undefined;

  updatedBy?: string = undefined;
}
