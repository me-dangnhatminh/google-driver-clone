import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { ConfigService } from '@nestjs/config';
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
      url: `${host}:${50051}`,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [path.resolve(__dirname, '../../../protos')],
      },
      onLoadPackageDefinition(pkg, server) {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  });

  const doc = setupSwagger(app).docPrefix;
  await app.startAllMicroservices();
  await app.listen(port, host);

  logger.log(`GRPC Server is running on ${host}:${50051}`);
  logger.log(`${appName} is running on http://${host}:${port}`);
  logger.log(`Documentation is running on http://${host}:${port}/${doc}`);
}

bootstrap();
