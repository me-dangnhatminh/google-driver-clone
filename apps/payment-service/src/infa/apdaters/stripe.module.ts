import {
  CallHandler,
  ExecutionContext,
  Logger,
  Module,
  NestInterceptor,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { catchError } from 'rxjs';

import Stripe from 'stripe';

export class StripeExceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(StripeExceptionInterceptor.name);

  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      catchError((error: unknown) => {
        const isStripeError = error instanceof Stripe.errors.StripeError;
        if (!isStripeError) throw new Error('Stripe library error');

        const type = error.type;
        switch (type) {
          case 'StripeInvalidRequestError':
            throw 'invalid_request_error';

          case 'StripeAPIError':
            throw 'api_error';

          default:
            throw error;
        }
      }),
    );
  }
}

@Module({
  providers: [
    {
      provide: Stripe,
      inject: [ConfigService],
      useFactory: () => {
        return new Stripe(process.env.STRIPE_SECRET_KEY || '');
      },
    },
    { provide: APP_INTERCEPTOR, useClass: StripeExceptionInterceptor },
  ],
  exports: [Stripe],
})
export class StripeModule {}
