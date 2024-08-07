import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import setupSwagger from './docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });

  setupSwagger(app);

  await app.listen(4000, () => {
    console.log('Payment Service is running on http://localhost:4000');
  });
}
bootstrap();
