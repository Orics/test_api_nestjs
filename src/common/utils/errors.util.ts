export class Error {
  message: string;
  error?: any;
  constructor(message: string, error?: any) {
    this.message = message;
    this.error = error;
  }
}

export class ErrorResponse extends Error {
  status?: number;
  message: string;
  code?: string;
  error?: any;
  constructor(message: string, status?: number, error?: any, code?: string) {
    super(message);
    this.message = message;
    this.status = status;
    this.code = code;
    this.error = error;
  }
}

export class InvalidErrorResponse extends ErrorResponse {
  status?: number;
  message: string;
  code?: string;
  error?: any;
  constructor(
    properties?: {
      name?: string;
      value?: any;
      message?: string;
    }[],
    status?: number,
    code?: string,
  ) {
    super('Invalid properties');
    this.message = 'Invalid properties';
    this.status = status || 400;
    this.code = code;
    this.error = {
      properties,
    };
  }
}
export const InvalidErrorHttpStatus = 400;

export class DuplidatedErrorResponse extends ErrorResponse {
  status?: number;
  message: string;
  code?: string;
  error?: any;
  constructor(duplicateProperty: string, code?: string) {
    super(`Duplicated ${duplicateProperty}`);
    this.message = `Duplicated ${duplicateProperty}`;
    this.status = 409;
    this.code = code;
    this.error = {
      property: duplicateProperty,
    };
  }
}
export const DuplidatedErrorHttpStatus = 409;

export class NotFoundErrorResponse extends ErrorResponse {
  status?: number;
  message: string;
  code?: string;
  error?: any;
  constructor(notFoundEntityName: string, code?: string) {
    super(`Not found ${notFoundEntityName}`);
    this.message = `Not found ${notFoundEntityName}`;
    this.status = 404;
    this.code = code;
  }
}
export const NotFoundErrorHttpStatus = 404;

export class PermissionDeniedErrorResponse extends ErrorResponse {
  status?: number;
  message: string;
  code?: string;
  error?: any;
  constructor() {
    super(`Permission denied`);
    this.message = `Permission denied`;
    this.status = PermissionDeniedErrorHttpStatus;
    this.code = 'permission_denied';
  }
}
export const PermissionDeniedErrorHttpStatus = 403;

export class UnauthorizedErrorResponse extends ErrorResponse {
  status?: number;
  message: string;
  code?: string;
  error?: any;
  constructor() {
    super(`Unauthorized`);
    this.message = `Unauthorized`;
    this.status = UnauthorizedErrorHttpStatus;
    this.code = 'unauthorized';
  }
}
export const UnauthorizedErrorHttpStatus = 401;

export class InternalServerErrorResponse extends ErrorResponse {
  status?: number;
  message: string;
  code?: string;
  error?: any;
  constructor(message: string, error?: any, code?: string) {
    super(message);
    this.message = message;
    this.status = 500;
    this.code = code;
    this.error = error;
  }
}
export const InternalServerErrorHttpStatus = 500;
