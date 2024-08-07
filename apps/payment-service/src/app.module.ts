import { Module, Provider } from '@nestjs/common';
import { MurLockModule } from 'murlock';
import { services } from './services';
import { controllers } from './controllers';
import { ClientsModule, Transport } from '@nestjs/microservices';

const providers: Provider[] = [];
providers.push(...services);

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'payment-service',
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
export class AppModule {}
