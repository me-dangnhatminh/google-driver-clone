import {
  CallHandler,
  ExecutionContext,
  Module,
  NestInterceptor,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { catchError, Observable } from 'rxjs';

import {
  StripeModule as NestStripe,
  STRIPE_CLIENT_TOKEN,
} from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';

export class StripeExceptionInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        throw error;
      }),
    );
  }
}

@Module({
  imports: [
    NestStripe.forRootAsync(NestStripe, {
      inject: [ConfigService],
      useFactory: () => {
        return { apiKey: String(process.env.STRIPE_SECRET_KEY) };
      },
    }),
  ],
  providers: [
    { provide: Stripe, useExisting: STRIPE_CLIENT_TOKEN },
    { provide: APP_INTERCEPTOR, useClass: StripeExceptionInterceptor },
  ],
  exports: [NestStripe, Stripe],
})
export class StripeModule {}
