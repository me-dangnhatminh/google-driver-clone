import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';

import * as grpc from '@grpc/grpc-js';

import { AppModule } from 'src/app.module';
import { Configs } from './configs';
import setupSwagger from './infa/docs';

const connectGRPC = (app: INestApplication) => {
  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService<Configs, true>);

  const grpcConfig = configService.get('grpc', { infer: true });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: grpcConfig.storage.url,
      package: grpcConfig.storage.package,
      protoPath: grpcConfig.storage.protoPath,
      loader: grpcConfig.loader,
      credentials: grpc.ServerCredentials.createInsecure(),
      onLoadPackageDefinition: (pkg, server: grpc.Server) => {
        const reflection = new ReflectionService(pkg);
        return reflection.addToServer(server);
      },
    },
  });
  logger.log(`gRPC connected: ${grpcConfig.storage.url}`);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin, callback) => callback(null, true),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
  });

  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService<Configs, true>);
  const appConfig = configService.get('app', { infer: true });

  const doc = setupSwagger(app).docPrefix;

  connectGRPC(app);

  await app.startAllMicroservices();
  await app.listen(appConfig.port, appConfig.host).then(() => {
    logger.log(`${appConfig.name} is running`);
    logger.log(`Documentation is running on ${doc}`);
    logger.log(`REST API is running on ${appConfig.host}:${appConfig.port}`);
  });
}

bootstrap();
