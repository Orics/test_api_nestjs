import { SORT_ORDER_MAP } from './constant.util';
import { Filter, GetQuery } from './request.util';

export class CheckerUtil {
  static validateGetQuery<T = any>(
    query?: GetQuery<T>,
  ):
    | {
        name: string;
        value: any;
        message: string;
      }
    | undefined {
    if (query) {
      // validate limit
      if (query.limit != undefined && query.limit < 1) {
        return {
          name: 'limit',
          value: query.limit,
          message: '"limit" must be a number greater then 0',
        };
      }

      // validate page
      if (query.page != undefined && query.page < 1) {
        return {
          name: 'page',
          value: query.page,
          message: '"page" must be a number greater then 0',
        };
      }
      if (query.page && !query.limit) {
        return {
          name: 'page',
          value: query.page,
          message: 'required to set "limit" when setting "page"',
        };
      }

      // validate sorts
      if (query.sorts) {
        if (!Array.isArray(query.sorts)) {
          query.sorts = [query.sorts];
        }
        if (query.sorts.length > 0) {
          for (const [i, sort] of Object.entries(query.sorts)) {
            const [property, order] = sort.split('.');
            if (!property || !order) {
              return {
                name: `sorts[${i}]`,
                value: sort,
                message: 'sort element must be in format [property].[order]',
              };
            }
            if (!order || !Object.keys(SORT_ORDER_MAP).includes(order)) {
              return {
                name: `sorts[${i}]`,
                value: sort,
                message: `sort order must be one of [${Object.values(
                  SORT_ORDER_MAP,
                )}]`,
              };
            }
          }
        }
      }

      // validete filter
      if (query.filter) {
        return validateFilter(query.filter);
      } else {
        return undefined;
      }
      function validateFilter(filter: Filter<T>, scope?: string) {
        scope = scope ? scope + '.' + 'filter' : 'filter';
        if (!filter) {
          return {
            name: scope,
            value: filter,
            message: 'filter must not be null or empty',
          };
        }

        if (
          !Object.keys(filter).every((attr) =>
            ['type', 'filters'].includes(attr),
          )
        ) {
          return {
            name: scope,
            value: filter,
            message: `accept only propertys "type" and "filters"`,
          };
        }

        const { type, filters } = filter;

        if (!['AND', 'OR'].includes(type)) {
          return {
            name: scope + '.' + 'type',
            value: type,
            message: 'type must be one of "AND" or "OR"',
          };
        }
        if (!Array.isArray(filters)) {
          return {
            name: scope + '.' + 'filters',
            value: filters,
            message: 'filters must be a array',
          };
        }
        if (filters.length > 0) {
          for (const [i, filter] of Object.entries(filters)) {
            scope = scope + '.' + 'filters';
            if (
              'property' in filter &&
              'operator' in filter &&
              'value' in filter
            ) {
              if (
                !Object.keys(filter).every((attr) =>
                  ['property', 'operator', 'value'].includes(attr),
                )
              ) {
                return {
                  name: scope + `[${i}]`,
                  value: filter,
                  message: `accept only propertys "property", "operator" and "value"`,
                };
              }

              switch (filter.operator) {
                case 'eq':
                case 'lt':
                case 'lte':
                case 'ne':
                case 'gt':
                case 'gte':
                  break;
                case 'in':
                  if (!filter.value || !Array.isArray(filter.value)) {
                    return {
                      name: scope + `[${i}]`,
                      value: filter,
                      message: 'IN operator must be with an array value',
                    };
                  }
                  break;
                case 'between':
                  if (
                    !filter.value ||
                    !Array.isArray(filter.value) ||
                    filter.value.length !== 2
                  ) {
                    return {
                      name: scope + `[${i}]`,
                      value: filter,
                      message:
                        'BETWEEN operator must be with a two-element array value',
                    };
                  }
                  break;
                case 'like':
                  if (!filter.value || !filter.value.includes('%')) {
                    return {
                      name: scope + `[${i}]`,
                      value: filter,
                      message:
                        'LIKE operator must be accompanied by a string value containing the % character',
                    };
                  }
                  break;
              }
            }
            // else if ('type' in filter && 'filters' in filter) {
            //return validateFilter(filter, scope + '.' + 'filter');
            //}
            else {
              return {
                name: scope + `[${i}]`,
                value: filter,
                message: `filter is incorrect format`,
              };
            }
          }
        }

        return undefined;
      }
    }
  }

  static isMatchedFilter(record: object, filter?: Filter) {
    if (!filter) {
      return true;
    }
    // const { type, filters } = filter;
    // let checked;
    // for (const filter of filters) {
    //   if(filter.operator == 'between')
    // }
    return false;
  }
}
