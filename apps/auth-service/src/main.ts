declare const module: any;

import { Server } from 'http';
import { NestFactory } from '@nestjs/core';
import {
  INestApplication,
  Logger,
  RequestMethod,
  VersioningType,
} from '@nestjs/common';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import * as grpc from '@grpc/grpc-js';

import AppModule from './app.module';
import buildSwagger from './infa/docs';
import winston from './infa/adapters/winston.module';
import { ConfigService } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winston,
    abortOnError: true,
    rawBody: true,
  });

  // ----- microservices -----
  buildMicroservices(app);

  // ----- http server -----
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });
  buildSwagger(app);
  await app
    .listen(process.env.PORT || 3000, process.env.HOST || 'localhost')
    .then((server: Server) => {
      const url = server.address() as { address: string; port: number };
      Logger.log(
        `Server is running on: ${url.address}:${url.port}`,
        'NestApplication',
      );
    });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

const buildMicroservices = (app: INestApplication) => {
  const configService = app.get(ConfigService);

  const grpcConfig = configService.get('grpc.auth', { infer: true });
  const credentials = grpc.ServerCredentials.createInsecure();

  const service = app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      ...grpcConfig,
      credentials,
      onLoadPackageDefinition: (pkg, server: grpc.Server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  });
  service.listen().then(() => {
    Logger.log(
      `gRPC server is running on: ${grpcConfig.url}`,
      'NestMicroservice',
    );
  });
};

bootstrap();
