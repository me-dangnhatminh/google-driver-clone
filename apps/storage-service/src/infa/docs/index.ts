import { INestApplication, Logger } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { ConfigService } from 'src/config';

export function buildSwagger(app: INestApplication) {
  const logger = new Logger('Swagger');
  const configService = app.get(ConfigService);
  const swaggerConfig = configService.infer('swagger');

  const documentBuild = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addServer(swaggerConfig.gateway, 'Gateway')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
  });

  const customOptions: SwaggerCustomOptions = {
    explorer: true,
    customSiteTitle: swaggerConfig.title,
    url: swaggerConfig.gateway,
    useGlobalPrefix: false,
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

  SwaggerModule.setup(swaggerConfig.prefix, app, document, customOptions);
  if (swaggerConfig.enabled) {
    const server: Server = app.getHttpServer();
    server.on('listening', () => {
      const address = server.address() as AddressInfo;
      const host = address.address === '::' ? 'localhost' : address.address;
      const port = address.port;
      const msg = `Swagger UI is running on http://${host}:${port}/${swaggerConfig.prefix}`;
      logger.log(msg);
    });
  }
}

export default buildSwagger;
