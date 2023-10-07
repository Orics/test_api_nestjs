import { UseInterceptors } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { LocalStorage } from './local.storage';

export function UseUploader(
  fieldname = 'file',
  storage = LocalStorage,
): MethodDecorator {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {
    UseInterceptors(
      FileInterceptor(fieldname, {
        storage: storage,
      }),
    )(target, method, descriptor);
  };
}

export function UseMultipleUploader(
  fieldname = 'files',
  storage = LocalStorage,
  maxCount?: number,
): MethodDecorator {
  return (target: any, method: string, descriptor: PropertyDescriptor) => {
    UseInterceptors(
      FilesInterceptor(fieldname, maxCount, {
        storage: storage,
      }),
    )(target, method, descriptor);
  };
}
