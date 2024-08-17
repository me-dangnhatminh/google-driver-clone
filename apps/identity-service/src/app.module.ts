import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import controllers from './controllers';

import { HTTPLogger } from './middlewares';
import { AuthService } from './services/auth.service';
import { TerminusModule } from '@nestjs/terminus';
import { CacheModule } from '@nestjs/cache-manager';
import { Auth0Module } from './adapters';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      expandVariables: true,
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: 'localhost:5000',
          package: 'identity',
          protoPath: path.resolve('protos/identity.proto'),
        },
      },
    ]),
    CacheModule.register(),
    TerminusModule,
    Auth0Module.forRoot({
      domain: 'dangnhatminh.us.auth0.com',
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT,
    }),
  ],
  controllers,
  providers: [AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
