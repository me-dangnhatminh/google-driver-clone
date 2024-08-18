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
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { services } from './app/services';

import { controllers } from './infa/controllers';
import { PersistencesModule } from './infa/persistence';
import { ResponseInterceptor } from './infa/interceptors';
import { HTTPLogger } from './infa/middlewares';
import { HttpExceptionFilter } from './infa/filters';
import { StripeModule } from '@golevelup/nestjs-stripe';

const providers: Provider[] = [];
providers.push(
  { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
);

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
        return redisStore({
          url: 'redis://redis.me-dangnhatminh.id.vn:6379',
          username: 'default',
          password: 'Nrf4OFJ4YqSZGlUsIauxP6mJ0JzXL1cB',
        }).catch((err) => {
          console.error(err);
          throw err;
        });
      },
    }),
    PersistencesModule,
    StripeModule.forRootAsync(StripeModule, {
      useFactory: () => {
        return {
          apiKey: String(process.env.STRIPE_SECRET_KEY),
        };
      },
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
