// build docs with swagger
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app) {
  const options = new DocumentBuilder()
    .setTitle('Payment Service')
    .setDescription('The payment service API description')
    .setVersion('1.0')
    .addTag('payment')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}

export default setupSwagger;
