import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const SERVICE_CODE = 'PAYMENT_SERVICE';
const Description = 'The Payment Service API description';

const buildSwagger = (app: INestApplication) => {
  const title = SERVICE_CODE.toUpperCase().split('_').join(' ');
  const options = new DocumentBuilder()
    .setTitle(title)
    .setDescription(Description)
    .setVersion('1.0')
    .addBearerAuth({
      description: 'Bearer token for authorization',
      name: 'Authorization',
      in: 'header',
      type: 'http',
    })
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });
  buildSwagger(app);
  await app.listen(4000);
}
bootstrap();
