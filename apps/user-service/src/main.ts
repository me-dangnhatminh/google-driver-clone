import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const logger = new Logger('UserMicroservice');
const port = 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port, () => {
    logger.log(`🚀 UserService is running on port ${port}`);
  });
}
bootstrap();
