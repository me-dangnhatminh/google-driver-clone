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

// const vaultClient = vault({
//   apiVersion: process.env.VAULT_API_VERSION || 'v1',
//   endpoint: process.env.VAULT_ADDR || 'http://localhost:8200',
//   token: process.env.VAULT_TOKEN || 'root',
// });

@Module({
  imports: [
    NestConfig.forRoot({
      envFilePath: ['.env', '.env.local'],
      load: Object.values(configs),
      expandVariables: true,
      isGlobal: true,
      cache: true,
      validate: async (config) => {
        // only validate env
        // const values = await vaultClient
        //   .read('secret/data/env')
        //   .then((res) => res?.data?.data)
        //   .catch((err) => {
        //     Logger.error(err, 'ConfigModule');
        //   });
        // if (!values) return config;
        // for (const key in values) {
        //   if (Boolean(config[key]) && config[key] !== values[key]) {
        //     const message = `override env '${key}'`;
        //     const obj = { message, old: config[key], new: values[key] };
        //     Logger.warn(JSON.stringify(obj, null, 2), 'ConfigModule');
        //   }
        //   process.env[key] = values[key];
        // }
        return config;
      },
    }),
  ],
  providers: [{ provide: ConfigService, useExisting: NestConfigService }],
  exports: [ConfigService],
})
export class ConfigModule {}
export default ConfigModule;
