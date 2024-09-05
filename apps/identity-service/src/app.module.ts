import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { redisStore } from 'cache-manager-redis-yet';
import * as path from 'path';
import * as grpc from '@grpc/grpc-js';

import { controllers, HTTPLogger, Auth0Module } from 'src/infa';
import config, { Config, RedisConfig } from 'src/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local'],
      load: config,
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
    TerminusModule,
    HttpModule,
    CacheModule.register({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config, true>) => {
        const redis = configService.get<RedisConfig>('redis');
        const url = `redis://${redis.host}:${redis.port}/${redis.db}`;
        const store = await redisStore({
          url,
          username: redis.username,
          password: redis.password,
        });
        Logger.log(`Redis connected: ${url}`, CacheModule.name);
        return { store };
      },
    }),

    Auth0Module.forRoot({
      domain: process.env.AUTH0_DOMAIN ?? '',
      clientId: process.env.AUTH0_CLIENT_ID ?? '',
      clientSecret: process.env.AUTH0_SECRET ?? '',
    }),

    ClientsModule.registerAsync([
      {
        inject: [ConfigService],
        name: 'IDENTITY_SERVICE',
        useFactory: (configService: ConfigService) => {
          const url = configService.get('svcUrl.identity.url');
          const protoDir =
            configService.get('PROTO_DIR') ||
            path.resolve(__dirname, '../../../protos');

          Logger.log(`Identity Service URL used: ${url}`, ClientsModule.name);
          return {
            transport: Transport.GRPC,
            options: {
              url,
              credentials: grpc.credentials.createSsl(),
              package: 'identity',
              protoPath: ['identity.proto'],
              loader: {
                includeDirs: [protoDir],
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
              },
            },
          };
        },
      },
    ]),
  ],
  controllers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
