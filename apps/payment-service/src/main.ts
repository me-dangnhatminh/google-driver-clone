import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import setupSwagger from './docs';

const logger = new Logger('PaymentService');
const port = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });

  setupSwagger(app);

  await app.listen(port, () => {
    logger.log('Payment Service is running on http://localhost:' + port);
  });
}
bootstrap();
