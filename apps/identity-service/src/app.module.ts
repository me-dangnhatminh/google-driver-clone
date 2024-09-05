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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['config/envs/.env'],
      expandVariables: true,
      isGlobal: true,
      cache: true,
    }),
    TerminusModule,
    HttpModule,
    Auth0Module.forRoot({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_SECRET,
    }),
    CacheModule.register({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const db = configService.get('REDIS_DB') || 0;
        const host = configService.get('REDIS_HOST') || 'localhost';
        const port = configService.get('REDIS_PORT') || 6379;
        const username = configService.get('REDIS_USERNAME');
        const password = configService.get('REDIS_PASSWORD');
        const store = await redisStore({
          url: `redis://${host}:${port}/${db}`,
          username,
          password,
        });
        return { store };
      },
    }),

    ClientsModule.registerAsync([
      {
        inject: [ConfigService],
        name: 'IDENTITY_SERVICE',
        useFactory: (configService: ConfigService) => {
          const url = `${configService.get('IDENTITY_SERVICE_URL') || 'localhost:50051'}`;
          const protoDir = `${configService.get('PROTO_DIR') || path.resolve(__dirname, '../../../protos')}`;
          Logger.log(`Identity Service URL used: ${url}`, 'ClientsModule');
          return {
            transport: Transport.GRPC,
            options: {
              url,
              credentials: grpc.credentials.createSsl(),
              maxSendMessageLength: 1024 * 1024 * 2000, // 100MB
              maxReceiveMessageLength: 1024 * 1024 * 2000, // 100MB
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
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}

// {
//   name: 'IDENTITY_SERVICE',
//   transport: Transport.GRPC,
//   options: {
//     url: 'localhost:50051',
//     package: 'identity',
//     protoPath: ['identity.proto'],
//     loader: {
//       keepCase: true,
//       longs: String,
//       enums: String,
//       defaults: true,
//       oneofs: true,
//       includeDirs: [path.resolve(__dirname, '../../../protos')],
//     },
//   },
// },
