import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import Stripe from 'stripe';

@Module({
  providers: [
    {
      provide: Stripe,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const stripeSecretKey = configService.get('STRIPE_SECRET_KEY');
        const timeout = 3000;
        return new Stripe(stripeSecretKey, { timeout });
      },
    },
  ],
  exports: [Stripe],
})
export class StripeModule implements OnModuleInit {
  private readonly logger = new Logger(StripeModule.name);
  constructor(private readonly stripe: Stripe) {}

  onModuleInit() {
    return this.stripe.accounts.list({ limit: 1 }).then(() => {
      this.logger.log(`Stripe connected`);
    });
  }
}

export default StripeModule;
