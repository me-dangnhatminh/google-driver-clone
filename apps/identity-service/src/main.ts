import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';

import { AppModule } from './app.module';
import setupSwagger from './infa/docs';
import winston from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: winston });
  const configService = app.get(ConfigService);
  const logger = new Logger('bootstrap');

  const nodeEnv = configService.get('NODE_ENV') || 'development';
  const appName = configService.get('APP_NAME') || 'App';
  const host = configService.get('HOST') || '0.0.0.0';
  const port = configService.get('PORT') || 3000;
  const allowedOrigins: Set<string> =
    `${configService.get('ALLOWED_ORIGINS') || ''}`
      .split(',')
      .map((origin) => origin.trim())
      .reduce((acc, origin) => {
        acc.add(origin);
        return acc;
      }, new Set<string>());

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin, callback) => {
      if (nodeEnv === 'development' || !origin) return callback(null, true);
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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
        includeDirs: [path.resolve(__dirname, '../../../protos')],
      },
      onLoadPackageDefinition: (pkg, server: grpc.Server) => {
        server.bindAsync(
          '0.0.0.0:50051',
          grpc.ServerCredentials.createInsecure(),
          (err, port) => {
            if (err) return logger.error(err);
            logger.log(`gRPC listening on: ${port}`);
          },
        );

        const reflection = new ReflectionService(pkg);
        return reflection.addToServer(server);
      },
    },
  });

  const doc = setupSwagger(app).docPrefix;
  await app.startAllMicroservices();
  await app.listen(port, host).then(() => {
    logger.log(`${appName} is running on http://${host}:${port}`);
    logger.log(`Documentation is running on http://${host}:${port}/${doc}`);
  });

  return app;
}

bootstrap();
