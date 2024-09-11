import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CqrsModule } from '@nestjs/cqrs';
import * as grpc from '@grpc/grpc-js';
import { CacheModule } from '@nestjs/cache-manager';

import configs, { Configs } from 'src/configs';
import providers from 'src/app';

import { PersistencesModule } from './infa/persistence';
import { controllers } from './infa/controllers';
import { HTTPLogger } from './infa/middlewares';
import { MulterModule } from './infa/adapters';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      load: configs,
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
    CqrsModule,
    CacheModule.register({ isGlobal: true }),
    PersistencesModule,
    MulterModule,
    ClientsModule.registerAsync({
      clients: [
        {
          inject: [ConfigService],
          name: 'STORAGE_SERVICE',
          useFactory: (configService: ConfigService<Configs, true>) => {
            const grpcConfig = configService.get('grpc', { infer: true });
            return {
              transport: Transport.GRPC,
              options: {
                package: grpcConfig.storage.package,
                protoPath: grpcConfig.storage.protoPath,
                url: grpcConfig.storage.url,
                loader: grpcConfig.loader,
              },
            };
          },
        },
        {
          inject: [ConfigService],
          name: 'IDENTITY_SERVICE',
          useFactory: (configService: ConfigService<Configs, true>) => {
            const grpcConfig = configService.get('grpc', { infer: true });
            return {
              transport: Transport.GRPC,
              options: {
                credentials: grpc.credentials.createSsl(),
                package: grpcConfig.identity.package,
                protoPath: grpcConfig.identity.protoPath,
                loader: grpcConfig.loader,
                url: grpcConfig.identity.url,
              },
            };
          },
        },
      ],
    }),
  ],
  controllers,
  providers,
})
export class AppModule implements NestModule {
  constructor() {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
