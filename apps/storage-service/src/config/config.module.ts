import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigType, ConfigModule as NestConfig } from '@nestjs/config';
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

export type Configs = {
  [K in keyof typeof configs]: ConfigType<(typeof configs)[K]>;
};

// export const vaultClient = vault({
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
    }),
  ],
  exports: [NestConfig],
})
export class ConfigModule implements OnModuleInit {
  onModuleInit() {
    // this.configService.get('app', { infer: true });
    // // get all configs
    // let current_version = '';
    // let error_count = 0;
    // const interval = setInterval(() => {
    //   vaultClient
    //     .read('secret/data/env')
    //     .then((res) => {
    //       const version = res.data.metadata.version;
    //       if (version === current_version) return;
    //       current_version = version;
    //       const valut = res.data.data;
    //       console.log('new version', version);
    //       console.log(valut);
    //     })
    //     .catch((err) => {
    //       error_count++;
    //       if (error_count > 5) {
    //         clearInterval(interval);
    //       }
    //       console.log('error', err.message);
    //     });
    // }, 1000);
  }
}
export default ConfigModule;
