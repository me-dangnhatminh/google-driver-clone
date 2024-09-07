import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import { AppConfig, Configs } from './configs';

import setupSwagger from './infa/docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');

  const configService = app.get(ConfigService<Configs, true>);
  const appConfig = configService.get<AppConfig>('app');

  const doc = setupSwagger(app).docPrefix;
  await app.startAllMicroservices();
  await app.listen(appConfig.port, appConfig.host).then(() => {
    logger.log(`${appConfig.name} is running`);
    logger.log(`Documentation is running on ${doc}`);
    logger.log(`REST API is running on ${appConfig.host}:${appConfig.port}`);
  });
}
bootstrap();
