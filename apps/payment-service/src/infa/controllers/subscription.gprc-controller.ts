import { Cache } from '@nestjs/cache-manager';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import Stripe from 'stripe';

@Controller()
export class SubscriptionGprcController {
  constructor(
    private readonly stripe: Stripe,
    private readonly cache: Cache,
  ) {}

  @GrpcMethod('SubscriptionService', 'customerPlan')
  async customerPlan(request) {
    const cached = await this.cache.get(request.customerId);
    if (cached) return cached;

    const customer = await this.stripe.customers
      .list({
        email: request.customerId,
        expand: ['data.subscriptions'],
        limit: 1,
      })
      .then((res) => res.data[0]);
    if (!customer) throw new Error('Customer not found');

    const subscription = customer.subscriptions?.data[0];
    if (!subscription) {
      const FREE_PLAN = 'Free';
      const freeProduct = await this.stripe.products
        .list({ active: true })
        .then((res) => res.data)
        .then((products) => {
          return products.find((product) => product.name === FREE_PLAN);
        });
      if (!freeProduct) throw new Error('Free plan not found');
      const res = { plan: FREE_PLAN, metadata: freeProduct.metadata };
      await this.cache.set(request.customerId, res, 10 * 60 * 1000); // 10 minutes
      return res;
    }

    const res = {
      plan: subscription.items.data[0].plan.nickname,
      metadata: subscription.items.data[0].plan.metadata,
    };

    await this.cache.set(request.customerId, res, 10 * 60 * 1000); // 10 minutes
    return res;
  }
}
