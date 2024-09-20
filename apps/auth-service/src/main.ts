import { NestFactory } from '@nestjs/core';
import { ForbiddenException, INestApplication, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';

import { Configs } from './config';
import { AppModule } from './app.module';
import setupSwagger from './infa/docs';

const connectGRPC = (app: INestApplication) => {
  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService<Configs, true>);

  const grpcConfig = configService.get('grpc.auth', { infer: true });
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

const buildCors = (app: INestApplication) => {
  const configService = app.get(ConfigService<Configs, true>);
  const corsConfig = configService.get('cors', { infer: true });

  if (corsConfig.enabled) {
    const originMap: Set<string> = new Set<string>();
    corsConfig.origin
      .split(',')
      .map((origin) => origin.trim())
      .forEach(originMap.add, originMap);
    app.enableCors({
      origin: (origin, callback) => {
        const allowed = corsConfig.origin === '*' || originMap.has(origin);
        if (allowed) return callback(null, true);
        return callback(new ForbiddenException('Not allowed by CORS'));
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<Configs, true>);
  const logger = new Logger('bootstrap');

  const appConfig = configService.get('app', { infer: true });

  app.setGlobalPrefix('api');

  buildCors(app);
  connectGRPC(app);

  const doc = setupSwagger(app).docPrefix;
  await app.startAllMicroservices();
  await app.listen(appConfig.port, appConfig.host).then(() => {
    logger.log(`${appConfig.name} is running`);
    logger.log(`Documentation is running on ${doc}`);
    logger.log(`REST API is running on ${appConfig.host}:${appConfig.port}`);
  });

  return app;
}

bootstrap();
