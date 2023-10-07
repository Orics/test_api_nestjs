import { ApiBody, ApiResponseSchemaHost } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export class ApiControllerTagOptions {
  name?: string;
  description?: string;
}

export class ApiActionOptions {
  tags?: string[] = undefined;
  summary?: string = undefined;
  description?: string = undefined;
  operationId?: string = undefined;
  path?: string = undefined;
  security?: any[] = undefined;
  requestBody?: ApiRequestBodyOptions = undefined;
  parameters?: ApiParameterOptions[] = undefined;
  responses?: {
    [status: string]: ApiResponseOptions;
  } = undefined;
  components?: {
    schemas: {
      [schema: string]: ApiSchemaOptions;
    };
  } = undefined;
}

export class ApiPathsOptions {
  [path: string]: ApiPathOptions;
}

export class ApiPathOptions {
  get?: ApiActionOptions = undefined;
  post?: ApiActionOptions = undefined;
  put?: ApiActionOptions = undefined;
  patch?: ApiActionOptions = undefined;
  delete?: ApiActionOptions = undefined;
}

export class ApiParameterOptions {
  name?: string = undefined;
  in?: 'header' | 'query' | 'path' = undefined;
  description?: string = undefined;
  required?: boolean = undefined;
  explode?: boolean = undefined;
  example?: any = undefined;
  style?:
    | 'matrix'
    | 'label'
    | 'form'
    | 'simple'
    | 'deepObject'
    | 'pipeDelimited'
    | 'spaceDelimited' = undefined;
  schema?: ApiSchemaOptions = undefined;
  content?: {
    'application/json': {
      schema: ApiSchemaOptions;
    };
  };
}

export class ApiRequestBodyOptions {
  description?: string = undefined;
  content?: {
    'application/json'?: {
      schema: ApiSchemaOptions;
    };
    'application/octet-stream'?: {
      schema: {
        type: 'string';
        format: 'binary';
      };
    };
  } = undefined;
}

export class ApiResponseOptions {
  description: string = undefined;
  content: {
    'application/json': {
      schema: ApiSchemaOptions;
    };
  } = undefined;
}

export type ApiSchemaOptions = SchemaObject;
//  {
//   type?: ApiPropertyType = undefined;
//   format?:
//     | 'float'
//     | 'double'
//     | 'int32'
//     | 'int64'
//     | 'date '
//     | 'date-time'
//     | 'uuid'
//     | 'uri'
//     | 'ipv4' = undefined;
//   default?: any = undefined;
//   pattern?: string;
//   nullable?: boolean = undefined;
//   readOnly?: boolean = undefined;
//   items?: ApiSchemaOptions = undefined;
//   enum?: string[] = undefined;
//   properties?: {
//     [property: string]: ApiSchemaOptions;
//   } = undefined;
//   example?: any = undefined;
//   minLength?: number = undefined;
//   maxLength?: number = undefined;
//   $ref?: string = undefined;
// }

export type ApiPropertyType =
  | 'string'
  | 'object'
  | 'number'
  | 'integer'
  | 'array'
  | 'boolean';

export type ApiActionMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type ApiParammesterType = 'path' | 'header' | 'query';
