import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { redisStore } from 'cache-manager-redis-yet';
import * as grpc from '@grpc/grpc-js';

import { controllers, HTTPLogger, Auth0Module } from 'src/infa';
import configs, { Configs } from 'src/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      load: configs,
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
    TerminusModule,
    HttpModule,
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configs, true>) => {
        const redis = configService.get('redis', { infer: true });
        const url = `redis://${redis.host}:${redis.port}/${redis.db}`;
        Logger.log(`Redis connected: ${url}`, CacheModule.name);
        return {
          store: redisStore,
          url: url,
          username: redis.username,
          password: redis.password,
        };
      },
    }),
    Auth0Module.forRoot({
      domain: process.env.AUTH0_DOMAIN ?? '',
      clientId: process.env.AUTH0_CLIENT_ID ?? '',
      clientSecret: process.env.AUTH0_SECRET ?? '',
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          inject: [ConfigService],
          name: 'IDENTITY_SERVICE',
          useFactory: (configService: ConfigService<Configs, true>) => {
            const grpcConfig = configService.get('grpc', { infer: true });
            return {
              transport: Transport.GRPC,
              options: {
                package: grpcConfig.identity.package,
                credentials: grpc.credentials.createSsl(),
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
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
