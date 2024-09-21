import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';

export const PAYMENT_CLIENT = Symbol('PAYMENT_CLIENT');

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PAYMENT_CLIENT,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const grpcConfig = configService.get('grpc.payment');

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
      provide: 'SubscriptionService',
      inject: [PAYMENT_CLIENT],
      useFactory: (client) => client.getService('SubscriptionService'),
    },
  ],
  exports: ['SubscriptionService'],
})
export class PaymentClientModule {}
