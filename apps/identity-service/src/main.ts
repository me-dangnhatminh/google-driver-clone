import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { auth } from 'express-openid-connect';
import { Logger } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import * as path from 'path';

const PORT = process.env.PORT;
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
  const app = await NestFactory.create(AppModule);
  app.use(auth0Middleware);

  app.enableCors({
    origin: (origin, callback) => {
      return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // app.connectMicroservice({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: ['amqp://localhost:5672'],
  //     queue: 'identity_queue',
  //     queueOptions: { durable: false },
  //   },
  // });

  app.connectMicroservice({
    transport: Transport.GRPC,
    options: {
      package: 'identity',
      protoPath: path.resolve('protos/identity.proto'),
    },
  });

  const host = '0.0.0.0';
  const port = 4040;
  const appName = 'Identity Service';

  await app.startAllMicroservices();
  await app.listen(PORT, () => {
    Logger.log(`${appName} is running on http://${host}:${port}`, '🚀');
    Logger.log(`RabbitMQ is running on http://${host}:15672`, '🐇');
  });
}
bootstrap();
