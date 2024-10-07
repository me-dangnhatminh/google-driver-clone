import { Module } from '@nestjs/common';
import {
  ConfigType,
  ConfigModule as NestConfig,
  ConfigService as NestConfigService,
  registerAs,
} from '@nestjs/config';

import appConfig from './app.config';
import dbConfig from './db.config';
import rmqConfig from './rmq.config';
import grpcConfig from './grpc.config';
import authConfig from './auth.config';

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
  auth: authConfig,
  db: dbConfig,
  grpc: grpcConfig,
  redis: redisConfig,
  swagger: swaggerConfig,
  rmq: rmqConfig,
};

export type Config = {
  [K in keyof typeof configs]: ConfigType<(typeof configs)[K]>;
};

export class ConfigService extends NestConfigService<Config, true> {}

@Module({
  imports: [
    NestConfig.forRoot({
      envFilePath: ['.env', '.env.local'],
      load: Object.values(configs),
      expandVariables: true,
      isGlobal: true,
      cache: true,
      validate: (config) => config,
    }),
  ],
  providers: [{ provide: ConfigService, useExisting: NestConfigService }],
  exports: [ConfigService],
})
export class ConfigModule {}
export default ConfigModule;
