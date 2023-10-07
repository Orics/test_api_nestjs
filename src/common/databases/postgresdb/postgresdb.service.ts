import * as _ from 'lodash';
import { GENERAL_CONFIG } from '../../configs/general.config';
import { Filter, GetQuery } from '../../utils/request.util';

export abstract class PostgresService<T = any> {
  abstract getList(query: GetQuery<T>, options?: GetOptions<T>): Promise<T>;

  abstract getOne(id: string, options?: GetOptions<T>): Promise<T>;

  abstract getOneBy(
    property: keyof T,
    value: any,
    options?: GetOptions<T>,
  ): Promise<T>;

  abstract create(data: Partial<T>): Promise<T>;

  abstract updateById(id: string, data: Partial<T>): Promise<T>;

  abstract updateList(ids: string[], data: Partial<T>): Promise<T[]>;

  abstract removeById(id: string): Promise<boolean>;

  abstract removeList(ids: string[]): Promise<number>;

  abstract checkUniqueConstraint(
    data: Partial<T>,
    exceptId?: string,
  ): Promise<
    {
      name: string;
      value: any;
      message: string;
    }[]
  >;

  abstract checkExistById(id: string): Promise<boolean>;
}

export class GetOptions<T = any> {
  relations?: boolean | (keyof T)[] = false;
  filter?: Filter = undefined;
  cache?: boolean = GENERAL_CONFIG.ENABLE_CACHE;
}
