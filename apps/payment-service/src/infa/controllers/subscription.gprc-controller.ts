import { Cache } from '@nestjs/cache-manager';
import { Controller, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcLoggingInterceptor } from 'libs/common';
import Stripe from 'stripe';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class SubscriptionGprcController {
  private readonly TIME_CACHE = 10 * 60 * 1000; // 10 minutes

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
        expand: ['data.subscriptions.data.plan'],
        limit: 1,
      })
      .then((res) => {
        if (res.data.length > 1) {
          throw new Error(`customer.duplicated: ${request.customerId}`);
        } else if (res.data[0]) {
          return res.data[0];
        } else {
          return this.stripe.customers.create({
            email: request.customerId,
            expand: ['subscriptions.data.plan'],
          });
        }
      });

    const subscription = customer.subscriptions?.data[0];

    let res: { plan: string; metadata: Record<string, string> };

    if (!subscription) {
      const FREE_PLAN = 'Free';
      const freeProduct = await this.stripe.products
        .list({ active: true })
        .then((res) => res.data)
        .then((products) => {
          return products.find((product) => product.name === FREE_PLAN);
        });
      if (!freeProduct) throw new Error('Free plan not found');
      res = { plan: FREE_PLAN, metadata: freeProduct.metadata };
    } else {
      const productId = subscription.items.data[0].plan.product?.toString();
      if (!productId) throw new Error('Product not found');

      const product = await this.stripe.products.retrieve(productId);
      res = { plan: product.name, metadata: product.metadata };
    }

    await this.cache.set(request.customerId, res, this.TIME_CACHE);
    return res;
  }
}
