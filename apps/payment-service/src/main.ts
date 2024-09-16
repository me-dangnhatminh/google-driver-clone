import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';

import setupSwagger from './infa/docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });

  setupSwagger(app);

  await app.startAllMicroservices();

  const host = '0.0.0.0';
  const port = 4000;
  const appName = 'Payment Service';

  await app.listen(port, () => {
    Logger.log(`${appName} is running on http://${host}:${port}`, '🚀');
    Logger.log(`Swagger is running on http://${host}:${port}/docs`, '📚');
  });
}
bootstrap();
