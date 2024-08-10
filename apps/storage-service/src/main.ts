import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

const logger = new Logger('StorageMicroservice');
const port = 5000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'storage-service',
      noAck: false,
    },
  });
  await app.startAllMicroservices();
  await app.listen(port, () => {
    logger.log(`🚀 StorageService is running on port ${port}`);
  });
}
bootstrap();
