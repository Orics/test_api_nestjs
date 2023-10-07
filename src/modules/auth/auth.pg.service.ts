import { Injectable, Inject } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as jose from 'jose';
import * as _ from 'lodash';
import { In, getConnection } from 'typeorm';
import {
  GetOptions,
  PostgresService,
} from '../../common/databases/postgresdb/postgresdb.service';
import { Account, Role } from './auth.pg.entity';
import { AccountProvider, RoleProvider } from './auth.pg.providers';
import { GENERAL_CONFIG } from '../../common/configs/general.config';
import { AuthIdentity } from './auth.dto';
import { KeyObject, generateKeyPairSync } from 'node:crypto';
import { Error } from '../../common/utils/errors.util';
import { GetQuery } from '../../common/utils/request.util';
import { Converter } from '../../common/utils/converter.util';

@Injectable()
export class AuthService {
  constructor(
    @Inject('ACCOUNT_PG_PROVIDER')
    private accountProvider: AccountProvider,
    @Inject('ROLE_PG_PROVIDER')
    private roleProvider: RoleProvider,
  ) {}

  async verifyPassword(password: string, hash: string) {
    return compare(password, hash);
  }

  async hashPassword(password: string) {
    return hash(password, 10);
  }

  async signToken(account: Account) {
    const payload = {
      id: account.id,
      email: account.email,
    };

    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: GENERAL_CONFIG.TOKEN_MODULUS_LENGTH,
    });

    const secretKey = publicKey.export({
      type: 'spki',
      format: 'pem',
    }) as string;

    await this.accountProvider
      .update(account.id, { secretKey })
      .catch((err) => {
        throw new Error('Error update secret key for account', err);
      });

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: GENERAL_CONFIG.TOKEN_EXPIRE_IN,
    });

    return token;
  }

  async verifyToken(token: string): Promise<AuthIdentity | undefined> {
    const decoded = jwt.decode(token, { json: true });
    if (!decoded) {
      return;
    }
    const account = await this.accountProvider.findOne({
      select: {
        id: true,
        secretKey: true,
        role: {
          id: true,
          permissions: true,
        },
      },
      where: { id: decoded.id },
      relations: {
        role: true,
      },
    });
    if (!account) {
      return;
    }
    const publicKey: KeyObject = await jose.importSPKI(
      account.secretKey,
      'RS256',
    );
    const verified = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    if (!verified) {
      return;
    }
    return {
      id: decoded.id,
      email: decoded.email,
      exp: decoded.exp,
      iat: decoded.iat,
      permissions: account.role?.permissions,
    };
  }
}

export class AccountService implements PostgresService {
  constructor(
    @Inject('ACCOUNT_PG_PROVIDER') private accountProvider: AccountProvider,
  ) {}

  async create(data: Partial<Account>) {
    const account = new Account();
    Object.assign(account, data);
    return this.accountProvider.save(account);
  }

  async getList(
    query: GetQuery<Partial<Account>>,
    options?: GetOptions<Partial<Account>>,
  ) {
    const { filter, sorts, page, limit } = query;

    let mixedFilter;
    if (options?.filter) {
      mixedFilter = Converter.mixFilter('AND', [options.filter, filter]);
    } else {
      mixedFilter = filter;
    }

    const postgresQuery = Converter.toPostgresQuery<Account>({
      filter: mixedFilter,
      sorts,
      page,
      limit,
    });

    const relations = {};
    const metadata = getConnection().getMetadata(Account);
    if (options?.relations) {
      if (options.relations === true) {
        for (const relation of metadata.relations) {
          relations[relation.propertyName] = true;
        }
      }
      if (Array.isArray(options.relations) && options.relations.length > 0) {
        for (const relation of options.relations) {
          relations[relation] = true;
        }
      }
    }

    const [accounts, count] = await this.accountProvider
      .findAndCount({
        ...postgresQuery,
        relations,
        cache: options?.cache || GENERAL_CONFIG.ENABLE_CACHE,
      })
      .catch((err) => {
        throw new Error('Error get list accounts', err);
      });

    return Converter.toPaginate(
      { records: accounts, count },
      query.page,
      query.limit,
    );
  }

  async getOne(id: string, options?: GetOptions<Partial<Account>>) {
    const metadata = getConnection().getMetadata(Account);
    const relations = {};
    if (options?.relations) {
      if (options.relations === true) {
        for (const relation of metadata.relations) {
          relations[relation.propertyName] = true;
        }
      }
      if (Array.isArray(options.relations) && options.relations.length > 0) {
        for (const relation of options.relations) {
          relations[relation] = true;
        }
      }
    }

    return this.accountProvider.findOne({
      where: { id },
      relations,
      cache: options?.cache || GENERAL_CONFIG.ENABLE_CACHE,
    });
  }

  async getOneBy(
    property: keyof Account,
    value: any,
    options?: GetOptions<Partial<Account>>,
  ) {
    const metadata = getConnection().getMetadata(Account);
    const relations = {};
    if (options?.relations) {
      if (options.relations === true) {
        for (const relation of metadata.relations) {
          relations[relation.propertyName] = true;
        }
      }
      if (Array.isArray(options.relations) && options.relations.length > 0) {
        for (const relation of options.relations) {
          relations[relation] = true;
        }
      }
    }

    return this.accountProvider.findOne({
      where: { [property]: value },
      relations,
      cache: options?.cache || GENERAL_CONFIG.ENABLE_CACHE,
    });
  }

  async updateById(id: string, data: Partial<Account>) {
    const result = await this.accountProvider.update(id, data);
    if (result.affected != 1) {
      throw new Error('Error update account');
    }
    return this.accountProvider.findOne({
      where: { id: id },
      withDeleted: true,
    });
  }

  async updateList(ids: string[], data: Partial<Account>) {
    const result = await this.accountProvider.update({ id: In(ids) }, data);
    if (result.affected < ids.length) {
      throw new Error('Error update list accounts');
    }
    return this.accountProvider.find({
      where: { id: In(ids) },
      withDeleted: true,
    });
  }

  async removeById(id: string) {
    return this.accountProvider
      .delete(id)
      .then((result) => result.affected === 1);
  }

  async removeList(ids: string[]) {
    return this.accountProvider
      .delete({ id: In(ids) })
      .then((result) => result.affected);
  }

  async checkUniqueConstraint(data: Partial<Account>, exceptId?: string) {
    const metadata = getConnection().getMetadata(Account);
    let properties = [];
    for (const unique of metadata.uniques) {
      properties = properties.concat(unique.givenColumnNames);
    }
    properties = _.union(properties).filter((property) =>
      Object.keys(data).includes(property),
    );
    const where = properties.map((property) => {
      return { [property]: data[property] };
    });
    const records = await this.accountProvider.findBy(where);

    const errors = properties
      .map((property) => {
        const record = records.find(
          (record) =>
            record.id != exceptId && record[property] == data[property],
        );
        if (record) {
          return {
            name: property,
            value: data[property],
            message: `${property} "${data[property]}" already existed`,
          };
        }
      })
      .filter((err) => err);
    return errors;
  }

  async checkExistById(id: string) {
    return this.accountProvider
      .count({ where: { id: id } })
      .then((count) => count > 0);
  }
}

export class RoleService implements PostgresService {
  constructor(@Inject('ROLE_PG_PROVIDER') private roleProvider: RoleProvider) {}

  async create(data: Partial<Role>) {
    const role = new Role();
    Object.assign(role, data);
    return this.roleProvider.save(role);
  }

  async getList(
    query: GetQuery<Partial<Role>>,
    options?: GetOptions<Partial<Role>>,
  ) {
    const { filter, sorts, page, limit } = query;

    let mixedFilter;
    if (options?.filter) {
      mixedFilter = Converter.mixFilter('AND', [options.filter, filter]);
    } else {
      mixedFilter = filter;
    }

    const postgresQuery = Converter.toPostgresQuery<Role>({
      filter: mixedFilter,
      sorts,
      page,
      limit,
    });

    const relations = {};
    const metadata = getConnection().getMetadata(Role);
    if (options?.relations) {
      if (options.relations === true) {
        for (const relation of metadata.relations) {
          relations[relation.propertyName] = true;
        }
      }
      if (Array.isArray(options.relations) && options.relations.length > 0) {
        for (const relation of options.relations) {
          relations[relation] = true;
        }
      }
    }

    const [roles, count] = await this.roleProvider
      .findAndCount({
        ...postgresQuery,
        relations,
        cache: options?.cache || GENERAL_CONFIG.ENABLE_CACHE,
      })
      .catch((err) => {
        throw new Error('Error get list roles', err);
      });

    return Converter.toPaginate(
      { records: roles, count },
      query.page,
      query.limit,
    );
  }

  async getOne(id: string, options?: GetOptions<Partial<Role>>) {
    const metadata = getConnection().getMetadata(Role);
    const relations = {};
    if (options?.relations) {
      if (options.relations === true) {
        for (const relation of metadata.relations) {
          relations[relation.propertyName] = true;
        }
      }
      if (Array.isArray(options.relations) && options.relations.length > 0) {
        for (const relation of options.relations) {
          relations[relation] = true;
        }
      }
    }

    return this.roleProvider.findOne({
      where: { id },
      relations,
      cache: options?.cache || GENERAL_CONFIG.ENABLE_CACHE,
    });
  }

  async getOneBy(
    property: keyof Role,
    value: any,
    options?: GetOptions<Partial<Role>>,
  ) {
    const metadata = getConnection().getMetadata(Role);
    const relations = {};
    if (options?.relations) {
      if (options.relations === true) {
        for (const relation of metadata.relations) {
          relations[relation.propertyName] = true;
        }
      }
      if (Array.isArray(options.relations) && options.relations.length > 0) {
        for (const relation of options.relations) {
          relations[relation] = true;
        }
      }
    }

    return this.roleProvider.findOne({
      where: { [property]: value },
      relations,
      cache: options?.cache || GENERAL_CONFIG.ENABLE_CACHE,
    });
  }

  async updateById(id: string, data: Partial<Role>) {
    const result = await this.roleProvider.update(id, data);
    if (result.affected != 1) {
      throw new Error('Error update role');
    }
    return this.roleProvider.findOne({ where: { id: id }, withDeleted: true });
  }

  async updateList(ids: string[], data: Partial<Role>) {
    const result = await this.roleProvider.update({ id: In(ids) }, data);
    if (result.affected < ids.length) {
      throw new Error('Error update list roles');
    }
    return this.roleProvider.find({
      where: { id: In(ids) },
      withDeleted: true,
    });
  }

  async removeById(id: string) {
    return this.roleProvider.delete(id).then((result) => result.affected === 1);
  }

  async removeList(ids: string[]) {
    return this.roleProvider
      .delete({ id: In(ids) })
      .then((result) => result.affected);
  }

  async checkUniqueConstraint(data: Partial<Role>, exceptId?: string) {
    const metadata = getConnection().getMetadata(Role);
    let properties = [];
    for (const unique of metadata.uniques) {
      properties = properties.concat(unique.givenColumnNames);
    }
    properties = _.union(properties).filter((property) =>
      Object.keys(data).includes(property),
    );
    const where = properties.map((property) => {
      return { [property]: data[property] };
    });
    const records = await this.roleProvider.findBy(where);

    const errors = properties
      .map((property) => {
        const record = records.find(
          (record) =>
            record.id != exceptId && record[property] == data[property],
        );
        if (record) {
          return {
            name: property,
            value: data[property],
            message: `${property} "${data[property]}" already existed`,
          };
        }
      })
      .filter((err) => err);
    return errors;
  }

  async checkExistById(id: string) {
    return this.roleProvider
      .count({ where: { id: id } })
      .then((count) => count > 0);
  }
}
