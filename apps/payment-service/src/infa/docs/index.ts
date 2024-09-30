import { INestApplication, Logger } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { Server } from 'http';

export function setupSwagger(app: INestApplication) {
  const docPrefix = 'docs';
  const docName = 'Payment Service API';
  const docDesc = 'The payment service API description';
  const docVersion = '1.0';

  const documentBuild = new DocumentBuilder()
    .setTitle(docName)
    .setDescription(docDesc)
    .setVersion(docVersion)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });

  const customOptions: SwaggerCustomOptions = {
    explorer: true,
    customSiteTitle: docName,
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

  SwaggerModule.setup(docPrefix, app, document, customOptions);

  const server: Server = app.getHttpServer();
  server.on('listening', () => {
    const address = server.address() as { address: string; port: number };
    Logger.log(
      `Swagger UI started on http://${address.address}:${address.port}/${docPrefix}`,
      'NestApplication',
    );
  });

  return document;
}

export default setupSwagger;
