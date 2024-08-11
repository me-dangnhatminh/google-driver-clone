import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export function setupSwagger(app) {
  const docPrefix = 'docs';
  const docName = 'Payment Service API';
  const docDesc = 'The payment service API description';
  const docVersion = '1.0';

  const documentBuild = new DocumentBuilder()
    .setTitle(docName)
    .setDescription(docDesc)
    .setVersion(docVersion)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });

  const customOptions: SwaggerCustomOptions = {
    explorer: true,
    customSiteTitle: docName,
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayOperationId: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
    },
  };

  SwaggerModule.setup(docPrefix, app, document, customOptions);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });

  setupSwagger(app);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'payment_queue',
      noAck: false,
      queueOptions: { durable: false },
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'identity_queue.token',
      prefetchCount: 1,
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();

  const host = '0.0.0.0';
  const port = 4000;
  const appName = 'Payment Service';

  await app.listen(port, () => {
    Logger.log(`${appName} is running on http://${host}:${port}`, '🚀');
    Logger.log(`Swagger is running on http://${host}:${port}/docs`, '📚');
    Logger.log(`RabbitMQ is running on http://${host}:15672`, '🐇');
  });
}
bootstrap();
