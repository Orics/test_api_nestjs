import { ApiQuery } from '@nestjs/swagger';
import {
  DEFINE_TYPE_ENTITY_DECORATOR_KEY,
  DEFINE_TYPE_IS_ARRAY_DECORATOR_KEY,
  FILTER_OPERATOR_ARRAY,
  FILTER_TYPE_MAP,
  SORT_ORDER_MAP,
} from './constant.util';

export function DefineType(
  entityClass: new () => any,
  option?: { isArray: boolean },
): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    if (option?.isArray) {
      Reflect.defineMetadata(
        DEFINE_TYPE_IS_ARRAY_DECORATOR_KEY,
        true,
        target,
        propertyKey,
      );
    }
    Reflect.defineMetadata(
      DEFINE_TYPE_ENTITY_DECORATOR_KEY,
      entityClass,
      target,
      propertyKey,
    );
  };
}

export function ApiGetQuery(entityClass?: new () => any) {
  return function (
    target: any,
    methodName: string,
    descriptor: PropertyDescriptor,
  ) {
    const object = entityClass ? new entityClass() : {};

    ApiQuery({
      schema: {
        type: 'object',
        properties: {
          type: {
            type: 'object',
            properties: {
              filter: {
                type: 'object',
                description: `
                  type is one of [${Object.values(FILTER_TYPE_MAP)}]
                  filters[].operator is one of [${FILTER_OPERATOR_ARRAY}]
                  filters[].property is one of [${Object.keys(object)}]
                  `,
                properties: {
                  type: {
                    type: 'string',
                    enum: Object.values(FILTER_TYPE_MAP),
                  },
                  filters: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        operator: {
                          type: 'string',
                          enum: [...FILTER_OPERATOR_ARRAY],
                        },
                        value: {
                          type: 'string',
                        },
                        property: {
                          type: 'string',
                          enum: Object.keys(object),
                        },
                      },
                    },
                  },
                },
              },
              sorts: {
                type: 'array',
                description: `
                  [].order is one of [${Object.keys(SORT_ORDER_MAP)}]
                  [].property is one of [${Object.keys(object)}]
                  `,
                items: {
                  type: 'object',
                  properties: {
                    property: {
                      type: 'string',
                      enum: Object.keys(object),
                    },
                    order: {
                      type: 'string',
                      enum: Object.keys(SORT_ORDER_MAP),
                    },
                  },
                },
              },
              page: {
                type: 'number',
                default: 1,
              },
              limit: {
                type: 'number',
              },
            },
          },
        },
      },
    })(target, methodName, descriptor);
  };
}
