import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';

import { AppConfig, Config, CorsConfig, GrpcConfig } from './config';

import { AppModule } from './app.module';
import setupSwagger from './infa/docs';
import winston from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: winston });
  const configService = app.get(ConfigService<Config, true>);
  const logger = new Logger('bootstrap');

  const appConfig = configService.get<AppConfig>('app');
  const corsConfig = configService.get<CorsConfig>('cors');
  const grpcConfig = configService.get<GrpcConfig>('grpc');

  app.setGlobalPrefix('api');

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
        return callback(new Error('Not allowed by CORS'));
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'identity',
      protoPath: ['identity.proto'],
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [path.resolve(__dirname, '../../../protos')], // TODO: add config
      },
      onLoadPackageDefinition: (pkg, server: grpc.Server) => {
        server.bindAsync(
          `${grpcConfig.host}:${grpcConfig.port}`,
          grpc.ServerCredentials.createInsecure(),
          (err, port) => {
            if (err) return logger.error(err);
            logger.log(`gRPC listening on ${port}`);
          },
        );

        const reflection = new ReflectionService(pkg);
        return reflection.addToServer(server);
      },
    },
  });

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
