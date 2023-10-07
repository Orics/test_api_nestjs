import 'reflect-metadata';
import {
  validationMetadatasToSchemas,
  validationMetadataArrayToSchemas,
  targetConstructorToSchema,
} from 'class-validator-jsonschema';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import * as _ from 'lodash';
import {
  FILTER_OPERATOR_ARRAY,
  FILTER_TYPE_MAP,
  GUARD_PERMISSIONS_DECORATOR_KEY,
} from '../utils/constant.util';
import { ErrorResponse } from '../utils/errors.util';
import {
  ApiActionMethod,
  ApiControllerTagOptions,
  ApiParameterOptions,
  ApiParammesterType,
  ApiActionOptions,
  ApiRequestBodyOptions,
  ApiResponseOptions,
  ApiSchemaOptions,
} from './docs.entity';
import { ValidationTypes } from 'class-validator';

export function getQueryParameters(entity?: new () => any) {
  return [
    {
      in: 'query',
      name: 'filter',
      description:
        "If you use 'AND' type, make sure the property must be unique. If has many duplicated property, the last property will be apply",
      required: false,
      content: {
        'application/json': {
          schema: {
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
                      enum: Object.values(FILTER_OPERATOR_ARRAY),
                    },
                    value: {
                      type: 'string',
                    },
                    property: {
                      type: 'string',
                      enum: entity ? Object.keys(new entity()) : undefined,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      in: 'query',
      name: 'sorts',
      required: false,
      description:
        "The sort element in the format [property].[order]. With 'order' can be one of ['asc', 'ASC', 'desc', 'DESC'] and 'property' is the name of the property you want to sort",
      style: 'deepObject',
      explode: true,
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      example: `${Object.keys(new entity()).shift()}.asc`,
    },
    {
      in: 'query',
      name: 'page',
      required: false,
      description: 'The current page you want to get',
      schema: {
        type: 'integer',
      },
      example: 1,
    },
    {
      in: 'query',
      name: 'limit',
      required: false,
      description: 'The number of records in return response',
      schema: {
        type: 'integer',
      },
      example: 10,
    },
  ] as ApiParameterOptions[];
}

export function getResponseListWithPagination(
  entity?: new () => any,
  example?: any,
) {
  const componentsSchemas = _defaultSchemas();
  return {
    description: 'Success',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'string',
              default: 'success',
            },
            status: {
              type: 'integer',
              default: 200,
            },
            data: {
              type: 'object',
              properties: {
                records: {
                  type: 'array',
                  items: getClassSchema(entity, componentsSchemas),
                },
                pagination: {
                  type: 'object',
                  properties: {
                    prevPage: {
                      type: 'integer',
                    },
                    currentPage: {
                      type: 'integer',
                    },
                    nextPage: {
                      type: 'integer',
                    },
                    pages: {
                      type: 'array',
                      items: {
                        type: 'integer',
                      },
                    },
                    totalPage: {
                      type: 'integer',
                    },
                    limit: {
                      type: 'integer',
                    },
                  },
                },
              },
            },
          },
          example: example,
        },
      },
    },
  } as ApiResponseOptions;
}

export function getResponseList(entity?: new () => any, example?: any) {
  const properties = {};
  if (entity) {
    const keys = Object.keys(new entity());
    for (const key of keys) {
      if (
        key === 'id' ||
        key === 'createdBy' ||
        key === 'updatedBy' ||
        key === 'deletedBy'
      ) {
        properties[key] = {
          type: 'string',
          format: 'uuid',
        };
      } else if (
        key === 'createdAt' ||
        key === 'updatedAt' ||
        key === 'deletedAt'
      ) {
        properties[key] = {
          type: 'string',
          format: 'date-time',
        };
      } else {
        properties[key] = {
          type: 'string',
        };
      }
    }
  }

  return {
    description: 'Success',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'string',
              default: 'success',
            },
            status: {
              type: 'integer',
              default: 200,
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: properties,
              },
            },
          },
          example: example,
        },
      },
    },
  } as ApiResponseOptions;
}

export function getResponseOne(entity?: new () => any, example?: any) {
  const properties = {};
  if (entity) {
    const keys = Object.keys(new entity());
    for (const key of keys) {
      if (
        key === 'id' ||
        key === 'createdBy' ||
        key === 'updatedBy' ||
        key === 'deletedBy'
      ) {
        properties[key] = {
          type: 'string',
          format: 'uuid',
        };
      } else if (
        key === 'createdAt' ||
        key === 'updatedAt' ||
        key === 'deletedAt'
      ) {
        properties[key] = {
          type: 'string',
          format: 'date-time',
        };
      } else {
        properties[key] = {
          type: 'string',
        };
      }
    }
  }

  return {
    description: 'Success',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'string',
              default: 'success',
            },
            status: {
              type: 'integer',
              default: 200,
            },
            data: {
              type: 'object',
              properties: properties,
            },
          },
          example: example,
        },
      },
    },
  } as ApiResponseOptions;
}

export function getResponseEmpty() {
  return {
    description: 'The resource was deleted or not existed',
  } as ApiResponseOptions;
}

export function getResponseError(error: ErrorResponse) {
  return {
    description: error.message,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            result: {
              type: 'string',
              default: 'error',
            },
            status: {
              type: 'integer',
              default: error.status,
            },
            message: {
              type: 'string',
              default: error.message,
            },
            error: {
              type: 'string',
              default: error.error,
            },
          },
          example: error,
        },
      },
    },
  } as ApiResponseOptions;
}

export function getClassSchema(entity: new () => any, schemas: any) {
  const entitySchema = targetConstructorToSchema(entity, {
    classTransformerMetadataStorage: defaultMetadataStorage,
    refPointerPrefix: '#/components/schemas/',
  }) as ApiSchemaOptions;

  const replaceRefsRecursively = (object, schemas) => {
    if (typeof object === 'object' && object !== null) {
      if (Array.isArray(object)) {
        return object.map((item) => replaceRefsRecursively(item, schemas));
      } else {
        let newObject = {};
        for (const key in object) {
          if (
            key == '$ref' &&
            object[key].startsWith('#/components/schemas/')
          ) {
            const schemaName = object[key].replace('#/components/schemas/', '');
            newObject = replaceRefsRecursively(schemas[schemaName], schemas);
          } else {
            newObject[key] = replaceRefsRecursively(object[key], schemas);
          }
        }
        return newObject;
      }
    }
    return object;
  };

  const covertedEntitySchema = replaceRefsRecursively(entitySchema, schemas);
  return covertedEntitySchema;
}

export function getControllerDescription(
  controller: new (...params: any) => any,
) {
  const description: {
    tag: ApiControllerTagOptions;
    paths: Record<string, ApiActionOptions>;
  } = {
    tag: {},
    paths: {},
  };

  const ctrlName = controller.name.replace('Controller', '');
  description.tag.name = ctrlName;
  description.tag.description = `${ctrlName} operators`;

  const METHOD_MAP = {
    0: 'get',
    1: 'post',
    2: 'delete',
    3: 'patch',
  };
  const REQUEST_DATA_TYPE_MAP = {
    '3:': 'requestBody',
    '4:': 'query',
    '5:': 'path',
  };

  const componentsSchemas = _defaultSchemas();

  const ctrlPath = Reflect.getMetadata('path', controller);
  const actionNames = Object.getOwnPropertyNames(controller.prototype);
  if (actionNames && Array.isArray(actionNames)) {
    for (const actionName of actionNames) {
      if (actionName == 'constructor') continue;
      const actAuth = Reflect.getMetadata(
        '__guards__',
        controller.prototype[actionName],
      );
      const actPermissions = Reflect.getMetadata(
        GUARD_PERMISSIONS_DECORATOR_KEY,
        controller.prototype[actionName],
      );
      const actMethodCode = Reflect.getMetadata(
        'method',
        controller.prototype[actionName],
      );
      const actMethod = METHOD_MAP[actMethodCode];
      const actPath = Reflect.getMetadata(
        'path',
        controller.prototype[actionName],
      );
      const actFullPath = `/${ctrlPath.replace(
        /^\/|\/$/g,
        '',
      )}/${actPath.replace(/^\/|\/$/g, '')}`;
      const actArgumentClasses: any[] = Reflect.getMetadata(
        'design:paramtypes',
        controller.prototype,
        actionName,
      );
      const actArgumentTypes = Reflect.getMetadata(
        '__routeArguments__',
        controller,
        actionName,
      );
      const actArguments = actArgumentClasses.map((_, i) => {
        return {
          class: actArgumentClasses[i],
          type: Object.entries(actArgumentTypes).find(
            ([key, value]: any) => value.index == i,
          ) as any,
        };
      });

      const actDescription: {
        requestBody?: ApiRequestBodyOptions;
        parameters?: ApiParameterOptions[];
      } = {
        parameters: [],
      };

      for (const actArgument of actArguments) {
        const [code, defineValue] = actArgument.type;
        const requestDataType = Object.entries(REQUEST_DATA_TYPE_MAP)?.find(
          ([key, _]) => code.startsWith(key),
        );
        // the argument must be one of requestBody, query or path
        if (requestDataType) {
          const [_, type] = requestDataType;
          if (type === 'requestBody') {
            const schema = getClassSchema(actArgument.class, componentsSchemas);
            //init requestBody if undefined
            if (!actDescription.requestBody) {
              undefined;
              actDescription.requestBody = {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {},
                    },
                  },
                },
              };
            }
            if (defineValue.property) {
              actDescription.requestBody.content[
                'application/json'
              ].schema.properties[defineValue.property] = schema;
            } else {
              actDescription.requestBody.content['application/json'].schema =
                schema;
            }
          }
          if (type == 'query' || type == 'path') {
            const schema = getClassSchema(actArgument.class, componentsSchemas);
            if (actArgument.class == Array) {
              actDescription.parameters.push({
                in: type,
                name: defineValue.data,
                description: 'paramester description',
                required: false,
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              });
            } else if (actArgument.class == String) {
              actDescription.parameters.push({
                in: type,
                name: defineValue.data,
                description: 'paramester description',
                required: false,
                schema: {
                  type: 'string',
                },
              });
            } else if (actArgument.class == Number) {
              actDescription.parameters.push({
                in: type,
                name: defineValue.data,
                description: 'paramester description',
                required: false,
                schema: {
                  type: 'number',
                },
              });
            } else if (actArgument.class == Boolean) {
              actDescription.parameters.push({
                in: type,
                name: defineValue.data,
                description: 'paramester description',
                required: false,
                schema: {
                  type: 'boolean',
                },
              });
            } else {
              actDescription.parameters.push({
                in: type,
                name: defineValue.data,
                description: 'paramester description',
                required: false,
                content: {
                  'application/json': {
                    schema: schema,
                  },
                },
              });
            }
          }
        }
      }

      _.merge(description.paths, {
        [actFullPath]: {
          [actMethod]: {
            tags: [`${ctrlName}`],
            description: 'action desccription',
            operationId: actionName,
            summary: actionName,
            security: actAuth ? [{ BearerAuth: [] }] : undefined,
            ...actDescription,
          },
          actionName: actionName,
        },
      });
    }
  }

  return description;
}

export function _defaultSchemas() {
  return {
    ...validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
      refPointerPrefix: '#/components/schemas/',
    }),
  };
}

export function _defaultSecuritySchemes() {
  return {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  };
}
