import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import setupSwagger from './infa/docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });

  setupSwagger(app);

  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: ['amqp://localhost:5672'],
  //     queue: 'payment_queue',
  //     noAck: false,
  //     queueOptions: { durable: false },
  //   },
  // });

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
