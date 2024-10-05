import { ClientsModule, Transport } from '@nestjs/microservices';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ConfigModule } from './config';

import providers from 'src/app';

import { PersistencesModule } from './infa/persistence';
import { controllers } from './infa/controllers';
import { CacheModule, MulterModule, WinstonModule } from './infa/adapters';

import { HTTPLogger } from 'libs/common';
import { AuthClientModule } from 'libs/auth-client';
import { StorageClientModule } from 'libs/storage-client';
import { PaymentClientModule } from 'libs/payment-client';

@Module({
  imports: [
    ConfigModule,
    WinstonModule,
    CqrsModule,
    CacheModule,
    PersistencesModule,
    MulterModule,
    // ===================== GRPC CLIENT MODULES =====================
    AuthClientModule,
    PaymentClientModule,
    StorageClientModule,

    ClientsModule.register([
      {
        name: 'StorageServiceRmq',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'storage-service',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
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
