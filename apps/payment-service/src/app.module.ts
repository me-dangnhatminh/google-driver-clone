import {
  MiddlewareConsumer,
  Module,
  NestModule,
  Provider,
} from '@nestjs/common';
import { MurLockModule } from 'murlock';
import { services } from './services';
import { controllers } from './infa/controllers';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HTTPLogger } from './middlewares';
import { CacheModule } from '@nestjs/cache-manager';

const providers: Provider[] = [];
providers.push(...services);

@Module({
  imports: [
    CacheModule.register(),
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
      {
        name: 'IDENTITY_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'identity_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
    MurLockModule.forRoot({
      logLevel: 'debug',
      maxAttempts: 3,
      wait: 1000,
      redisOptions: { url: 'redis://localhost:6379' },
    }),
  ],
  controllers,
  providers,
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HTTPLogger).forRoutes('*');
  }
}
