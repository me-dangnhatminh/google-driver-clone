import { Cache } from '@nestjs/cache-manager';
import { Controller, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcLoggingInterceptor } from 'libs/common';
import { Configs } from 'src/config';
import Stripe from 'stripe';

@Controller()
@UseInterceptors(GrpcLoggingInterceptor)
export class SubscriptionGprcController {
  private readonly TIME_CACHE = 10 * 60 * 1000; // 10 minutes

  readonly stripeConfig = this.configService.get('stripe', { infer: true });
  constructor(
    private readonly stripe: Stripe,
    private readonly cache: Cache,
    private readonly configService: ConfigService<Configs, true>,
  ) {}

  async getFreeProduct() {
    const freeId = this.stripeConfig.product.free;
    await this.cache.del(`stripe_product_${freeId}`);
    const cached = await this.cache.get(`stripe_product_${freeId}`);
    if (cached) return cached as Stripe.Response<Stripe.Product>;

    return this.stripe.products
      .retrieve(freeId, { expand: ['price', 'default_price'] })
      .then((product) => {
        return this.cache
          .set(`stripe_product_${freeId}`, product, 60 * 60 * 24) // 24 hours
          .then(() => product);
      });
  }

  @GrpcMethod('SubscriptionService', 'customerPlan')
  async customerPlan(request) {
    await this.cache.del(request.customerId);
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
