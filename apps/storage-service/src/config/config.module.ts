import { Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfig,
  ConfigService as NestConfigService,
  Path,
} from '@nestjs/config';

import configuration from './configuration';
import grpcConfig from './grpc.config';

type Config = ReturnType<typeof configuration> & {
  grpc: ReturnType<typeof grpcConfig>;
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
      load: [configuration, grpcConfig],
      expandVariables: true,
      cache: true,
      validate: (config) => config,
    }),
  ],
  providers: [NestConfigService, ConfigService],
  exports: [NestConfigService, ConfigService],
})
export class ConfigModule {}
export default ConfigModule;
