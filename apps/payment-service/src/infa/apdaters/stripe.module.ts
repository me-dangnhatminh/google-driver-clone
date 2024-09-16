import { Module } from '@nestjs/common';
import {
  StripeModule as NestStripe,
  STRIPE_CLIENT_TOKEN,
} from '@golevelup/nestjs-stripe';
import Stripe from 'stripe';

@Module({
  imports: [
    NestStripe.forRootAsync(NestStripe, {
      useFactory: () => {
        return {
          apiKey: String(process.env.STRIPE_SECRET_KEY),
        };
      },
    }),
  ],
  providers: [{ provide: Stripe, useExisting: STRIPE_CLIENT_TOKEN }],
  exports: [NestStripe, Stripe],
})
export class StripeModule {}
