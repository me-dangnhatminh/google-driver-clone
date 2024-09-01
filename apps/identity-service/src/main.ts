import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';

import { AppModule } from './app.module';
import setupSwagger from './infa/docs';
import winston from './logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: winston });

  const logger = new Logger('bootstrap');

  app.enableCors({
    origin: (origin, callback) => {
      // TODO: Add logic to check if the origin is allowed
      return callback(null, true);
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
      protoPath: 'protos/identity.proto',
      url: 'localhost:3001',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      onLoadPackageDefinition(pkg, server) {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  });

  await setupSwagger(app).then((res) => {
    logger.log(`Swagger is running on http://${host}:${port}/${res.docPrefix}`);
  });

  await app.startAllMicroservices();
  await app.listen(port, () => {
    logger.log(`${appName} is running on http://${host}:${port}`);
  });
}

bootstrap();
