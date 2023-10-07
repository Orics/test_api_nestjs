import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { GENERAL_CONFIG } from '../configs/general.config';
import { ErrorResponse, NotFoundErrorResponse } from '../utils/errors.util';
import { Response } from 'express';

@Catch()
export class ErrorException implements ExceptionFilter {
  catch(e: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Response>();
    const response = ctx.getResponse<Response>();
    let status, message, error, code;

    if (e instanceof ErrorResponse) {
      status = e.status;
      message = e.message;
      error = e.error;
      code = e.code;
    } else {
      status = e.status || 500;
      if (status === 404) {
        message = 'Not found';
        error = e.message;
      } else if (status === 500) {
        message = e.message || 'Unknow error';
        error = e.error || e;
      }
    }

    if (error instanceof TypeError || error instanceof Error) {
      error = {
        message: error.message,
      };
    }

    response.status(status).json({
      result: 'error',
      code,
      message,
      error,
    });
  }
}
