import { Global, Module } from '@nestjs/common';
import {
  ConfigType,
  ConfigModule as NestConfig,
  ConfigService as NestConfigService,
  Path,
} from '@nestjs/config';

// import * as vault from 'node-vault';

import appConfig from './app.config';
import dbConfig from './db.config';
import grpcConfig from './grpc.config';
import rmqConfig from './rmq.config';
import swaggerConfig from './swagger.config';

const configs = {
  app: appConfig,
  db: dbConfig,
  grpc: grpcConfig,
  rmq: rmqConfig,
  swagger: swaggerConfig,
};
export type Config = {
  [K in keyof typeof configs]: ConfigType<(typeof configs)[K]>;
};
export class ConfigService extends NestConfigService<Config, true> {
  infer<P extends Path<Config> = any>(path: P) {
    return this.get(path, { infer: true });
  }
}

@Global()
@Module({
  imports: [
    NestConfig.forRoot({
      envFilePath: [
        `.env`,
        `.env.local`,
        `.env.${process.env.NODE_ENV}`,
        `.env.${process.env.NODE_ENV}.local`,
        `.env.example`,
      ],
      load: Object.values(configs),
      expandVariables: true,
      cache: true,
      validate: (config) => config,
    }),
  ],
  providers: [ConfigService],
  exports: [NestConfig, ConfigService],
})
export class ConfigModule {}
export default ConfigModule;
