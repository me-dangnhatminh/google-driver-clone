import { INestApplication, Logger } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { Server } from 'http';
import { AddressInfo } from 'net';

export function buildSwagger(app: INestApplication) {
  const logger = new Logger('Swagger');
  const docPrefix = 'api/docs';
  const docName = 'Identity Service';
  const docDesc = 'API Documentation';
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
    const address = server.address() as AddressInfo;
    const host = address.address === '::' ? 'localhost' : address.address;
    const port = address.port;
    logger.log(`Swagger UI is running on http://${host}:${port}/${docPrefix}`);
  });
  return document;
}

export default buildSwagger;
