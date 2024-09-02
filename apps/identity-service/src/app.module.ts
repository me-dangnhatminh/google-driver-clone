import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { redisStore } from 'cache-manager-redis-yet';
import * as path from 'path';

import { controllers, HTTPLogger, Auth0Module } from 'src/infa';

path.resolve(__dirname, '../../../protos/identity.proto');

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['config/envs/.env'],
      expandVariables: true,
      isGlobal: true,
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

    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:3001',
          package: 'identity',
          protoPath: ['identity.proto'],
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [path.resolve(__dirname, '../../../protos')],
          },
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
