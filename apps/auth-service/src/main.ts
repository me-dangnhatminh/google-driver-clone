declare const module: any;

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import defaultLogger from './logger';
import buildGrpcServer from './grpc.server';
import buildHttpServer from './http.server';

import AppModule from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: defaultLogger,
    bufferLogs: true,
    abortOnError: true,
    rawBody: true,
    cors: false, // use cors in the api-gateway
  });

  // ----- microservices -----
  await buildGrpcServer(app);

  // ----- http server -----
  await buildHttpServer(app);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
