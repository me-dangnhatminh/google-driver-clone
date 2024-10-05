declare const module: any;

import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import * as grpc from '@grpc/grpc-js';
import { Server } from 'http';

import { ConfigService } from './config';
import { AppModule } from 'src/app.module';
import setupSwagger from './infa/docs';

const buildMicroservice = (app: INestApplication) => {
  const configService = app.get(ConfigService);

  const grpcConfig = configService.get('grpc.storage', { infer: true });

  const service = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      ...grpcConfig,
      credentials: grpc.ServerCredentials.createInsecure(),
      onLoadPackageDefinition: (pkg, server: grpc.Server) => {
        const reflection = new ReflectionService(pkg);
        return reflection.addToServer(server);
      },
    },
  });
  service.listen().then(() => {
    Logger.log(`gRPC connected: ${grpcConfig.url}`, 'NestMicroservice');
  });
  return service;
};

const buildRmq = (app: INestApplication) => {
  const configService = app.get(ConfigService);
  const rmqConfig = configService.get('rmq', { infer: true });

  const service = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqConfig.url],
      queue: rmqConfig.queue,
      noAck: false,
      queueOptions: { durable: false },
    },
  });

  service.listen().then(() => {
    Logger.log(`RMQ connected: ${rmqConfig.url}`, 'NestMicroservice');
  });
};

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule, {
    abortOnError: true,
    rawBody: true,
    bufferLogs: true,
  });
  const log = app.get(Logger);
  if (log) app.useLogger(log);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });
  setupSwagger(app);

  await app
    .listen(process.env.PORT || 3000, process.env.HOST || 'localhost')
    .then((server: Server) => {
      const address = server.address() as { address: string; port: number };
      const msg = `Application is running on: ${address.address}:${address.port}`;
      Logger.log(msg, 'NestApplication');
    });

  await buildRmq(app);
  await buildMicroservice(app);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  return app;
}

bootstrap();
