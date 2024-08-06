import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('StorageMicroservice');
const port = 5000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.listen(port, () => {
    logger.log(`🚀 StorageService is running on port ${port}`);
  });
}
bootstrap();
