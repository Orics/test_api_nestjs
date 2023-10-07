import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ErrorException } from './common/exceptions/error.exeption';
import { ValidatePipe } from './common/pipes/validate.pipe';
import { GENERAL_CONFIG } from './common/configs/general.config';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(GENERAL_CONFIG.APP_PREFIX_ENDPOINT);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    optionsSuccessStatus: 200,
  });

  app.useGlobalPipes(new ValidatePipe());

  app.useGlobalFilters(new ErrorException());

  app.listen(process.env.APP_PORT).then(() => {
    console.log(
      `[Server] running on port ${process.env.APP_PORT} and PID ${process.pid}`,
    );
  });
}
bootstrap();
