import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TestGetListRequestProps, TestGetListResponseProps } from './test.dto';
import {
  FILTER_OPERATOR_ARRAY,
  FILTER_TYPE_MAP,
  SORT_ORDER_MAP,
} from '../../common/utils/constant.util';

export class TestApiDocument {
  static Controller(): ClassDecorator {
    return function (target: any) {
      ApiTags('Test')(target);
    };
  }

  static create(): MethodDecorator {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
      // Authorize
      ApiBearerAuth()(target, method, descriptor);

      // TODO
    };
  }

  static getList(): MethodDecorator {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
      const entity = new TestGetListRequestProps();
      
      // Authorize
      ApiBearerAuth()(target, method, descriptor);

      // Request
      ApiQuery({
        type: 'object',
        name: 'query options',
        description: `
          filter.type is one of [${Object.values(FILTER_TYPE_MAP)}]
          filter.filters[].operator is one of [${FILTER_OPERATOR_ARRAY}]
          filter.filters[].property is one of [${Object.keys(entity)}]
          sorts[].order is one of [${Object.keys(SORT_ORDER_MAP)}]
          sorts[].property is one of [${Object.keys(entity)}]
        `,
        required: false,
        schema: {
          type: 'object',
          properties: {
            filter: {
              type: 'object',
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
                        enum: Object.keys(entity),
                      },
                    },
                  },
                },
              },
            },
            sorts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  property: {
                    type: 'string',
                    enum: Object.keys(entity),
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
      })(target, method, descriptor);

      // TODO
    };
  }

  static getOne(): MethodDecorator {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
      // Authorize
      ApiBearerAuth()(target, method, descriptor);

      // TODO
    };
  }

  static update(): MethodDecorator {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
      // Authorize
      ApiBearerAuth()(target, method, descriptor);

      // TODO
    };
  }

  static deleteOne(): MethodDecorator {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
      // Authorize
      ApiBearerAuth()(target, method, descriptor);

      // TODO
    };
  }

  static deleteList(): MethodDecorator {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
      // Authorize
      ApiBearerAuth()(target, method, descriptor);

      // TODO
    };
  }
}
