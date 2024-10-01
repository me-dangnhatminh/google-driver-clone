declare const module: any;

import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';

import * as grpc from '@grpc/grpc-js';

import { AppModule } from 'src/app.module';
import { Configs } from './config';
import setupSwagger from './infa/docs';

const connectGRPC = (app: INestApplication) => {
  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService<Configs, true>);

  const grpcConfig = configService.get('grpc.storage', { infer: true });

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        url: grpcConfig.url,
        package: grpcConfig.package,
        protoPath: grpcConfig.protoPath,
        loader: grpcConfig.loader,
        credentials: grpc.ServerCredentials.createInsecure(),
        onLoadPackageDefinition: (pkg, server: grpc.Server) => {
          const reflection = new ReflectionService(pkg);
          return reflection.addToServer(server);
        },
      },
    },
    { inheritAppConfig: true },
  );
  logger.log(`gRPC connected: ${grpcConfig.url}`);
};

const connectRMQ = (app: INestApplication) => {
  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService<Configs, true>);
  const rmqConfig = configService.get('rmq', { infer: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqConfig.url],
      queue: rmqConfig.queue,
      noAck: false,
      queueOptions: { durable: false },
    },
  });
  logger.log(`RMQ connected: ${rmqConfig.url}`);
};

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });

  const configService = app.get(ConfigService<Configs, true>);
  const appConfig = configService.get('app', { infer: true });

  const doc = setupSwagger(app).docPrefix;

  connectGRPC(app);
  connectRMQ(app);

  const logger = new Logger('bootstrap');
  await app.startAllMicroservices();
  await app.listen(appConfig.port, appConfig.host).then(() => {
    logger.log(`${appConfig.name} is running`);
    logger.log(`Documentation is running on ${doc}`);
    logger.log(`REST API is running on ${appConfig.host}:${appConfig.port}`);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
