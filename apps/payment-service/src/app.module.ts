import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MurLockModule } from 'murlock';
import { IdempotentService } from './services/idempotent.service';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    MurLockModule.forRoot({
      logLevel: 'debug',
      maxAttempts: 3,
      wait: 1000,
      redisOptions: {
        url: 'redis://localhost:6379',
      },
    }),
  ],
  controllers: [AppController],
  providers: [IdempotentService, PaymentService, AppService],
})
export class AppModule {}
