import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import * as _ from 'lodash';
import { InvalidErrorResponse } from '../utils/errors.util';
import { GetQuery } from '../utils/request.util';
import { CheckerUtil } from '../utils/checker.util';
import { AuthIdentity } from '../../modules/auth/auth.dto';

@Injectable()
export class ValidatePipe implements PipeTransform<any> {
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    const data = plainToClass(metatype, value);

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // if is a instance of class GetQuery then manual check
    if (data instanceof GetQuery) {
      const error = CheckerUtil.validateGetQuery(data);
      if (error) {
        throw new InvalidErrorResponse([error]);
      }
    }

    const errors = await validate(data, {
      whitelist: true, // supose this creates a white list with properties
      forbidNonWhitelisted: true, // supose this restrict by white list criteria
      forbidUnknownValues: true, // dont know why exists
    });
    if (errors.length > 0) {
      const paramesters = errors.map((error) => {
        const { property, constraints, children } = error;
        let message, detail;
        if (constraints) {
          for (const key in constraints) {
            if (constraints.hasOwnProperty(key)) {
              message = constraints[key];
              break;
            }
          }
        } else if (children) {
          for (const error of children) {
            const { property, constraints } = error;
            if (constraints) {
              for (const key in constraints) {
                if (constraints.hasOwnProperty(key)) {
                  message = constraints[key];
                  break;
                }
              }
              detail = property;
            }
          }
        }
        return {
          name: property,
          message,
          detail,
        };
      });
      throw new InvalidErrorResponse(paramesters);
    }

    return _.cloneDeep(value);
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object, AuthIdentity];

    return !types.includes(metatype);
  }
}
