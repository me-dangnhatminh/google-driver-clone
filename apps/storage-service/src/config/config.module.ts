import { Module } from '@nestjs/common';
import {
  ConfigType,
  ConfigModule as NestConfig,
  ConfigService as NestConfigService,
} from '@nestjs/config';

// import * as vault from 'node-vault';

import appConfig from './app.config';
import dbConfig from './db.config';
import grpcConfig from './grpc.config';
import rmqConfig from './rmq.config';
const configs = {
  app: appConfig,
  db: dbConfig,
  grpc: grpcConfig,
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
