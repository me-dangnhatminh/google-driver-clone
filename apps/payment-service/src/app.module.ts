import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
} from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { services } from './app/services';

import { controllers } from './infa/controllers';
import { PersistencesModule } from './infa/persistence';
import { ResponseInterceptor } from './infa/interceptors';
import { HTTPLogger } from './infa/middlewares';

const providers: Provider[] = [];
providers.push({ provide: APP_INTERCEPTOR, useClass: ResponseInterceptor });

providers.push(...services);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store() {
        return redisStore({ url: 'redis://localhost:6379' });
      },
    }),
    PersistencesModule,
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
