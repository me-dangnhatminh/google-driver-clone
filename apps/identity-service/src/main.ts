import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import * as path from 'path';

import { AppModule } from './app.module';
import setupSwagger from './infa/docs';
import winston from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: winston });
  const logger = new Logger('bootstrap');

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (origin, callback) => {
      return callback(null, true); // TODO: Add logic to check if the origin is allowed
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const host = '0.0.0.0';
  const port = 3000;
  const appName = 'Identity Service';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'identity',
      protoPath: ['identity.proto'],
      url: 'localhost:3001',
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

  setupSwagger(app);
  await app.startAllMicroservices();
  await app.listen(port, () => {
    logger.log(`${appName} is running on http://${host}:${port}`);
  });
}

bootstrap();
