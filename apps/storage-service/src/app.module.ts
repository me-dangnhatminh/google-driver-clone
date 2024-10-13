import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ConfigModule } from './config';

import providers from 'src/app';

import { PersistencesModule } from './infa/persistence';
import { controllers } from './infa/controllers';
import {
  LoggerModule,
  CacheModule,
  ElasticsearchModule,
  MulterModule,
} from './infa/adapters';

import { AuthClientModule } from '@app/auth-client';
import { StorageClientModule } from '@app/storage-client';
import { PaymentClientModule } from '@app/payment-client';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    CqrsModule,
    CacheModule,
    PersistencesModule,
    MulterModule,

    HttpModule,
    TerminusModule,
    ElasticsearchModule,

    // ===================== GRPC CLIENT MODULES =====================
    AuthClientModule,
    PaymentClientModule,
    StorageClientModule,

    ClientsModule.register([
      {
        name: 'StorageQueue',
        transport: Transport.RMQ,
        options: {
          noAck: true,
          persistent: true,
          urls: ['amqp://localhost:5672'],
          queue: 'storage_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers,
  providers,
})
export class AppModule {}
export default AppModule;
