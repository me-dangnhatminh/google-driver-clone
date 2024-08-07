import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logger = new Logger('UserMicroservice');

const TCP_PORT = 3001;
const HTTP_PORT = 3000;
const SERVICE_CODE = 'USER_SERVICE';

const buildSwagger = (app: INestApplication) => {
  const title = SERVICE_CODE.split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const options = new DocumentBuilder()
    .setTitle(title)
    .setDescription('The User Service API description')
    .addTag('users')
    .setVersion('1.0')
    .addBearerAuth({
      description: 'Bearer token for authorization',
      name: 'Authorization',
      in: 'header',
      type: 'http',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/doc', app, document);
};

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

  buildSwagger(app);

  await app.listen(HTTP_PORT).then(() => {
    logger.log(`🚀 UserService is running on port ${HTTP_PORT}`);
  });
}

bootstrap();
