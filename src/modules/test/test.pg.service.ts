import { Injectable, Inject } from '@nestjs/common';
import { In, getConnection } from 'typeorm';
import * as _ from 'lodash';
import { GENERAL_CONFIG } from '../../common/configs/general.config';
import { Test } from './test.pg.entity';
import { TestProvider } from './test.pg.providers';
import { Converter } from '../../common/utils/converter.util';
import { GetQuery } from '../../common/utils/request.util';
import { Error } from '../../common/utils/errors.util';
import {
  PostgresService,
  GetOptions,
} from '../../common/databases/postgresdb/postgresdb.service';

@Injectable()
export class TestService implements PostgresService {
  constructor(@Inject('TEST_PG_PROVIDER') private testProvider: TestProvider) {}

  async create(data: Partial<Test>) {
    const test = new Test();
    Object.assign(test, data);
    return this.testProvider.save(test);
  }

  async getList(
    query: GetQuery<Partial<Test>>,
    options?: GetOptions<Partial<Test>>,
  ) {
    const { filter, sorts, page, limit } = query;

    let mixedFilter;
    if (options?.filter) {
      mixedFilter = Converter.mixFilter('AND', [options.filter, filter]);
    } else {
      mixedFilter = filter;
    }

    const postgresQuery = Converter.toPostgresQuery<Test>({
      filter: mixedFilter,
      sorts,
      page,
      limit,
    });

    const relations = {};
    const metadata = getConnection().getMetadata(Test);
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

    const [tests, count] = await this.testProvider
      .findAndCount({
        ...postgresQuery,
        relations,
        cache: options?.cache || GENERAL_CONFIG.ENABLE_CACHE,
      })
      .catch((err) => {
        throw new Error('Error get list tests', err);
      });

    return Converter.toPaginate(
      { records: tests, count },
      query.page,
      query.limit,
    );
  }

  async getOne(id: string, options?: GetOptions<Partial<Test>>) {
    const metadata = getConnection().getMetadata(Test);
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

    return this.testProvider.findOne({
      where: { id },
      relations,
      cache: options?.cache || GENERAL_CONFIG.ENABLE_CACHE,
    });
  }

  async getOneBy(
    property: keyof Test,
    value: any,
    options?: GetOptions<Partial<Test>>,
  ) {
    const metadata = getConnection().getMetadata(Test);
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

    return this.testProvider.findOne({
      where: { [property]: value },
      relations,
      cache: options?.cache || GENERAL_CONFIG.ENABLE_CACHE,
    });
  }

  async updateById(id: string, data: Partial<Test>) {
    const result = await this.testProvider.update(id, data);
    if (result.affected != 1) {
      throw new Error('Error update test');
    }
    return this.testProvider.findOne({ where: { id: id }, withDeleted: true });
  }

  async updateList(ids: string[], data: Partial<Test>) {
    const result = await this.testProvider.update({ id: In(ids) }, data);
    if (result.affected < ids.length) {
      throw new Error('Error update list tests');
    }
    return this.testProvider.find({
      where: { id: In(ids) },
      withDeleted: true,
    });
  }

  async removeById(id: string) {
    return this.testProvider.delete(id).then((result) => result.affected === 1);
  }

  async removeList(ids: string[]) {
    return this.testProvider
      .delete({ id: In(ids) })
      .then((result) => result.affected);
  }

  async checkUniqueConstraint(data: Partial<Test>, exceptId?: string) {
    const metadata = getConnection().getMetadata(Test);
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
    const records = await this.testProvider.findBy(where);

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
    return this.testProvider
      .count({ where: { id: id } })
      .then((count) => count > 0);
  }
}
