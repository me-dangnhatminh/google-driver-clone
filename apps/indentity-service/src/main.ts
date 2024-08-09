import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { auth } from 'express-openid-connect';
import { Logger } from '@nestjs/common';

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_SECRET = process.env.AUTH0_SECRET;
console.log('BASE_URL', BASE_URL);

const auth0Middleware = auth({
  authRequired: false,
  auth0Logout: true,
  baseURL: `${BASE_URL}`,
  secret: AUTH0_SECRET,
  clientID: AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${AUTH0_DOMAIN}`,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(auth0Middleware);

  app.enableCors({
    origin: /http:\/\/localhost/,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(PORT, () => {
    Logger.log(`Server is running on http://localhost:${PORT}`, 'Bootstrap');
  });
}
bootstrap();
