/* eslint-disable @typescript-eslint/no-unused-vars */
import { FindManyOptions } from 'typeorm';
import { Filter, GetMixedQuery, MixedFilter } from './request.util';
import {
  DEFINE_TYPE_ENTITY_DECORATOR_KEY,
  DEFINE_TYPE_IS_ARRAY_DECORATOR_KEY,
  POSTGRES_WHERE_OPERATOR_MAP,
} from './constant.util';
import * as _ from 'lodash';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { Pagination } from './response.util';

export class Converter {
  static toPaginate<T>(
    result: { records: T[]; count: number },
    page = 1,
    limit?: number,
  ) {
    page = Number(page);
    limit = Number(limit);
    const pagination: Pagination = {
      prevPage: undefined,
      currentPage: page,
      nextPage: undefined,
      pages: [],
      totalPage: limit ? Math.ceil(result.count / limit) : 1,
      limit: limit,
    };

    if (pagination.currentPage - 1 >= 1) {
      pagination.prevPage = pagination.currentPage - 1;
    }
    if (pagination.currentPage + 1 <= pagination.totalPage) {
      pagination.nextPage = pagination.currentPage + 1;
    }

    let fromPage;
    let toPage;
    const MAX_PAGE_COUNT = 5;
    if (
      pagination.currentPage <=
      pagination.totalPage - Math.floor(MAX_PAGE_COUNT / 2)
    ) {
      fromPage = pagination.currentPage - Math.floor(MAX_PAGE_COUNT / 2);
      fromPage = fromPage >= 1 ? fromPage : 1;
      toPage = fromPage + MAX_PAGE_COUNT - 1;
      toPage = toPage <= pagination.totalPage ? toPage : pagination.totalPage;
    } else {
      toPage = pagination.currentPage + Math.floor(MAX_PAGE_COUNT / 2);
      toPage = toPage <= pagination.totalPage ? toPage : pagination.totalPage;
      fromPage = toPage - MAX_PAGE_COUNT + 1;
      fromPage = fromPage >= 1 ? fromPage : 1;
    }

    for (let i: number = fromPage; i <= toPage; i++) {
      pagination.pages.push(i);
    }

    return {
      records: result.records,
      pagination: pagination,
    };
  }

  static toPostgresQuery<T = any>(query: GetMixedQuery) {
    const postgresQuery: FindManyOptions<T> = {};

    if (query.filter) {
      const { type, filters } = query.filter;
      if (filters.length > 0) {
        const where = type === 'OR' ? [] : {};
        for (const filter of filters) {
          if ('property' in filter && 'operator' in filter) {
            const { property, operator, value } = filter;
            if (type === 'OR') {
              (where as any[]).push({
                [property.toString()]:
                  POSTGRES_WHERE_OPERATOR_MAP[operator as any](value),
              });
            }
            if (type === 'AND') {
              where[property.toString()] =
                POSTGRES_WHERE_OPERATOR_MAP[operator as any](value);
            }
          }
        }
        postgresQuery['where'] = where;
      }
    }

    if (query.sorts) {
      const order = {};
      if (!Array.isArray(query.sorts)) {
        query.sorts = [query.sorts];
      }
      for (const sort of query.sorts) {
        const [property, orderBy] = sort.split('.');
        order[property.toString()] = orderBy;
      }
      postgresQuery['order'] = order;
    }

    if (!query.page) {
      query.page = 1;
    }

    if (query.limit) {
      postgresQuery['take'] = Number(query.limit);
      const skip = Number(query.limit) * (Number(query.page) - 1);
      postgresQuery['skip'] = skip;
    }

    return postgresQuery;
  }

  static toElasticQuery<T = any>(query: GetMixedQuery, properties?: string[]) {
    const postgresQuery: QueryDslQueryContainer = {};
    return postgresQuery;
  }

  static mixFilter<T = any>(
    type: Filter<T>['type'],
    filters: Filter<T>[],
  ): MixedFilter {
    const andFilters = filters.filter((f) => f && f.type === 'AND');
    const orFilters = filters.filter((f) => f && f.type === 'OR');

    if (type === 'OR') {
      const result: MixedFilter<T> = {
        type: 'OR',
        filters: [],
      };
      result.filters.push(...andFilters);
      for (const orFilter of orFilters) {
        for (const orFilterItem of orFilter.filters) {
          const filter: Filter = {
            type: 'AND',
            filters: [orFilterItem],
          };
          result.filters.push(filter);
        }
      }
      return result;
    }

    if (type === 'AND') {
      const result: MixedFilter<T> = {
        type: 'AND',
        filters: [],
      };

      const mixeAndFilter = (() => {
        const mixeAndFilter: Filter<T> = {
          type: 'AND',
          filters: [],
        };
        for (const andFilter of andFilters) {
          for (const andFilterItem of andFilter.filters) {
            mixeAndFilter.filters.push(andFilterItem);
          }
        }
        return mixeAndFilter;
      })();

      if (orFilters.length > 0) {
        const mixedOrAndFilter = (() => {
          const mixedOrAndFilter: MixedFilter<T> = {
            type: 'OR',
            filters: [],
          };
          // n = orFilterCount * orSubFilterCount
          const n = orFilters.reduce(
            (i, orSubFilter) => i * orSubFilter.filters.length,
            1,
          );
          for (let i = 0; i < n; i++) {
            const andFilter: Filter = {
              type: 'AND',
              filters: [],
            };
            orFilters.forEach((orFilter) => {
              const item = orFilter.filters.pop();
              andFilter.filters.push(item);
            });
            mixedOrAndFilter.filters.push(andFilter);
          }
          return mixedOrAndFilter;
        })();

        if (mixeAndFilter.filters.length > 0) {
          mixedOrAndFilter.filters = mixedOrAndFilter.filters.map(
            (filter: Filter) => {
              filter.filters.push(...mixeAndFilter.filters);
              return filter;
            },
          );
        }

        result.type = mixedOrAndFilter.type;
        result.filters = mixedOrAndFilter.filters;
      } else {
        result.type = 'AND';
        result.filters = mixeAndFilter.filters;
      }

      return result;
    }
  }

  static fit<T>(object: T, targetClass: new () => Partial<T>): Partial<T> {
    const target = new targetClass();
    const formattedObject = _.pick(object, Object.keys(target));
    for (const property of Object.keys(target)) {
      const entity = Reflect.getMetadata(
        DEFINE_TYPE_ENTITY_DECORATOR_KEY,
        target,
        property,
      );
      const isArray = Reflect.getMetadata(
        DEFINE_TYPE_IS_ARRAY_DECORATOR_KEY,
        target,
        property,
      );
      if (typeof entity === 'function') {
        if (isArray) {
          formattedObject[property] = [];
          if (Array.isArray(object[property]) && object[property].length > 0) {
            for (const item of object[property]) {
              formattedObject[property].push(fit(item, entity));
            }
          }
        } else {
          formattedObject[property] = fit(object[property], entity);
        }
      } else {
        formattedObject[property] = object[property];
      }
    }

    return formattedObject;
  }
}
