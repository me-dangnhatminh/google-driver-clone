import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig, RMQConfig } from './configs';

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule);

  const appConfig = app.get(ConfigService<AppConfig, true>);
  const rmqConfig = app.get(ConfigService<RMQConfig, true>);
  const appName = appConfig.get('APP_NAME');
  const host = appConfig.get('APP_HOST');
  const port = appConfig.get('APP_PORT');

  const rmqUrls = rmqConfig.get('URLS');
  const rmqQueue = rmqConfig.get('QUEUE');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: rmqUrls,
      queue: rmqQueue,
      noAck: false,
      queueOptions: { durable: false },
      prefetchCount: 1,
    },
  });

  await app.startAllMicroservices();
  await app.listen(port, host, () => {
    logger.log(`${appName} is running at http://${host}:${port}`);
  });
}
bootstrap();
