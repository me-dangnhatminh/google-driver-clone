import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

const logger = new Logger('UserMicroservice');

const TCP_PORT = 3001;
const HTTP_PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: TCP_PORT,
      retryDelay: 3000,
      retryAttempts: 5,
    },
  });
  await app.startAllMicroservices();
  await app.listen(HTTP_PORT).then(() => {
    logger.log(`🚀 UserService is running on port ${HTTP_PORT}`);
  });
}

bootstrap();
