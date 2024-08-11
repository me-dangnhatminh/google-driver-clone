// build docs with swagger
import { Logger } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';

export function setupSwagger(app) {
  const logger = new Logger();
  const docPrefix = 'docs';
  const docName = 'Payment Service API';

  const documentBuild = new DocumentBuilder()
    .setTitle('Payment Service')
    .setDescription('The payment service API description')
    .setVersion('1.0')
    .addTag('payment')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      displayOperationId: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      filter: true,
    },
  };
  SwaggerModule.setup(docPrefix, app, document, {
    explorer: true,
    customSiteTitle: docName,
    ...customOptions,
  });
  logger.log(`Docs will serve on ${docPrefix}`, 'NestApplication');
}

export default setupSwagger;
