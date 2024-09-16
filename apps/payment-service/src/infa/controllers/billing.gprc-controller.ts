import Stripe from 'stripe';
import z from 'zod';

export class BillingGrpcController {
  constructor(private readonly stripe: Stripe) {}

  createProduct() {
    return this.stripe.products.create({
      name: 'Storage',
      type: 'service',
      description: 'A special product',
    });
  }
}
