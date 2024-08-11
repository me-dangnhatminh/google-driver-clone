import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
} from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HTTPLogger } from './infa/middlewares';
import { CacheModule } from '@nestjs/cache-manager';
import * as CacheManager from 'cache-manager-redis-yet';

import { services } from './app/services';
import { controllers } from './infa/controllers';
import { ConfigModule } from '@nestjs/config';
import { PersistencesModule } from './infa/persistence';

const providers: Provider[] = [];
providers.push(...services);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),
    PersistencesModule,
    CacheModule.register({
      isGlobal: true,
      store: CacheManager.redisStore,
      url: 'redis://localhost:6379',
    }),
    ClientsModule.register([
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'payment_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers,
  providers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
