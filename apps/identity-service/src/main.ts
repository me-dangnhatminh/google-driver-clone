import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { auth } from 'express-openid-connect';
import { Logger } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import setupSwagger from './infa/docs';
import winston from './logger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';

const BASE_URL = process.env.BASE_URL;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_SECRET = process.env.AUTH0_SECRET;

const auth0Middleware = auth({
  authRequired: false,
  auth0Logout: true,
  baseURL: `${BASE_URL}`,
  secret: AUTH0_SECRET,
  issuerBaseURL: `https://${AUTH0_DOMAIN}`,
  clientID: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_SECRET,
  authorizationParams: {
    response_type: 'code',
    response_mode: 'form_post',
    audience: `https://${AUTH0_DOMAIN}/api/v2/`,
    scope: 'openid profile email',
  },
  afterCallback: (req, res, session) => {
    return session;
  },
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({ instance: winston }),
  });

  const logger = new Logger('bootstrap');

  app.use(auth0Middleware);
  app.enableCors({
    origin: (origin, callback) => {
      // TODO: Add logic to check if the origin is allowed
      return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const host = '0.0.0.0';
  const port = 3000;
  const appName = 'Identity Service';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'identity',
      protoPath: 'protos/identity.proto',
      url: 'localhost:3001',
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
      onLoadPackageDefinition(pkg, server) {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  });

  setupSwagger(app).then((res) => {
    logger.log(`Swagger is running on http://${host}:${port}/${res.docPrefix}`);
  });

  await app.startAllMicroservices();
  await app.listen(port, () => {
    logger.log(`${appName} is running on http://${host}:${port}`);
  });
}
bootstrap();

// app.connectMicroservice<MicroserviceOptions>({
//   transport: Transport.GRPC,
//   options: {
//     package: 'identity', // ['identity', 'user']
//     loader: {
//       keepCase: true,
//       longs: String,
//       enums: String,
//       defaults: true,
//       oneofs: true,
//     },
//     protoPath: path.resolve('protos/identity.proto'),
//     onLoadPackageDefinition(pkg, server) {
//       new ReflectionService(pkg).addToServer(server);
//     },
//   },
// });

// logger.log(`RabbitMQ is running on http://${host}:15672`, '🐇');
// logger.log(
//   `Swagger is running on http://${host}:${port}/identity/docs`,
//   '📚',
// );
