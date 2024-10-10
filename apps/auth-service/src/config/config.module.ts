import { Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfig,
  ConfigService as NestConfigService,
  Path,
} from '@nestjs/config';
import configuration, { Config } from './configuration';
import grpcConfig from './grpc.config';

export class ConfigService extends NestConfigService<Config, true> {
  infer<P extends Path<Config> = any>(path: P) {
    return this.get(path, { infer: true });
  }
}

@Global()
@Module({
  imports: [
    NestConfig.forRoot({
      envFilePath: ['.env', '.env.local', '.env.development'],
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
