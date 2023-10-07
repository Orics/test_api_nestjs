import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join, resolve } from 'path';
import { GENERAL_CONFIG } from '../configs/general.config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(resolve(), GENERAL_CONFIG.PUBLIC_LOCATION.FOLDER_PATH),
      serveRoot: GENERAL_CONFIG.PUBLIC_LOCATION.ENPOINT,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(resolve(), GENERAL_CONFIG.DOCS_LOCATION.FOLDER_PATH),
      serveRoot: GENERAL_CONFIG.DOCS_LOCATION.ENPOINT,
    }),
  ],
})
export class StaticFileModule {}
