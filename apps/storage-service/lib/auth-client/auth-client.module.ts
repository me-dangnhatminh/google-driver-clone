import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IDENTITY_SERVICE_NAME } from './constant';
import * as grpc from '@grpc/grpc-js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: IDENTITY_SERVICE_NAME,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const grpcConfig = configService.get('grpc.identity');

          // TODO: Implement the logic to return the gRPC client options
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
  exports: [ClientsModule],
})
export class AuthClientModule {}