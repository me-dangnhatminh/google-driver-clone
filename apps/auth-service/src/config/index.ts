import { ConfigType, registerAs } from '@nestjs/config';

import appConfig from './app.config';
import dbConfig from './db.config';
import grpcConfig from './grpc.config';
import rmqConfig from './rmq.config';

const corsConfig = registerAs('cors', () => ({
  enabled: process.env.CORS_ENABLED || true,
  origin: process.env.CORS_ORIGIN || '*',
}));

const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  db: process.env.REDIS_DB || 0,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
}));

const swaggerConfig = registerAs('swagger', () => ({
  enabled: process.env.SWAGGER_ENABLED,
  title: process.env.SWAGGER_TITLE,
  description: process.env.SWAGGER_DESCRIPTION,
  prefix: process.env.SWAGGER_PREFIX,
  version: process.env.SWAGGER_VERSION,
}));

const configs = {
  app: appConfig,
  db: dbConfig,
  grpc: grpcConfig,
  redis: redisConfig,
  swagger: swaggerConfig,
  cors: corsConfig,
  rmq: rmqConfig,
};

export type Configs = {
  [K in keyof typeof configs]: ConfigType<(typeof configs)[K]>;
};
export default Object.values(configs);
