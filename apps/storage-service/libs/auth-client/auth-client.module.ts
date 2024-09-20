import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';

import { AUTH_SERVICE } from './constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const grpcConfig = configService.get('grpc.auth');

          const urlIsLocal = ['localhost', '127.0.0.1', '0.0.0.0'].includes(
            grpcConfig.url.split(':')[0],
          );
          return {
            transport: Transport.GRPC,
            options: {
              url: grpcConfig.url,
              package: grpcConfig.package,
              protoPath: grpcConfig.protoPath,
              loader: grpcConfig.loader,
              credentials: urlIsLocal
                ? grpc.credentials.createInsecure()
                : grpc.credentials.createSsl(),
            },
          };
        },
      },
    ]),
  ],
  providers: [
    {
      provide: 'AuthService',
      inject: [AUTH_SERVICE],
      useFactory: (client) => client.getService('AuthService'),
    },
    {
      provide: 'UserService',
      inject: [AUTH_SERVICE],
      useFactory: (client) => client.getService('UserService'),
    },
  ],
  exports: ['AuthService', 'UserService'],
})
export class AuthClientModule {}
