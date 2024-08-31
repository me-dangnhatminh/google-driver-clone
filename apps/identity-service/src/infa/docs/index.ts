import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export async function setupSwagger(app) {
  const docPrefix = 'identity/docs';
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
  return { docPrefix, docName, docDesc, docVersion };
}

export default setupSwagger;
