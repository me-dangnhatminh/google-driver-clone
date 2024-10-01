declare const module: any;

import { AddressInfo } from 'net';
import { Server } from 'http';
import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger } from '@nestjs/common';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';

import { Configs } from './config';
import AppModule from './app.module';

import buildSwagger from './infa/docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    abortOnError: true,
    rawBody: true,
  });

  // ----- microservices -----
  buildMicroservices(app);

  // ----- http server -----
  app.setGlobalPrefix('api');
  buildSwagger(app);
  await app
    .listen(process.env.PORT || 3000, process.env.HOST || 'localhost')
    .then((server: Server) => {
      const url: AddressInfo = server.address() as AddressInfo;
      Logger.log(`Server is running on: ${url.address}:${url.port}`);
    });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

const buildMicroservices = (app: INestApplication) => {
  const configService = app.get(ConfigService<Configs, true>);

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
