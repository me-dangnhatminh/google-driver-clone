import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService {
  constructor(@InjectStripeClient() private stripe: Stripe) {}

  async listProducts() {
    return this.stripe.products.list({}).then((res) => res.data);
  }

  createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string,
  ) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
    });
  }
}
