import { Cache } from '@nestjs/cache-manager';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import Stripe from 'stripe';

import { Authenticated, HttpUser } from 'libs/auth-client';
import { Configs } from 'src/config';
import { ConfigService } from '@nestjs/config';

@ApiTags('customer')
@ApiBearerAuth()
@Controller('payment/customer')
@UseGuards(Authenticated)
export class CustomerRestController {
  private readonly stripeConfig = this.config.get('stripe', { infer: true });
  constructor(
    private readonly config: ConfigService<Configs, true>,
    private readonly stripe: Stripe,
    private readonly cache: Cache,
  ) {}

  @Get('entitlements')
  async getEntitlements(@HttpUser() user) {
    const customerId = user.metadata.customer_id;
    // luu subscription_id vao metadata cua user
    if (!customerId) throw new Error('"customer_id" is required');

    const res = await this.stripe.subscriptions.list({
      customer: customerId,
      expand: [
        'data.plan.product',
        'data.plan.product.default_price',
        'data.customer',
      ],
    });

    return res;
    const plan = res.data[0]['plan'] as Stripe.Plan;
    if (!plan) throw new Error('Plan not found');
    return plan;

    return await this.stripe.entitlements.activeEntitlements
      .list({
        customer: customerId,
        expand: ['data.feature'],
        limit: 1,
      })
      .then((r) => {
        return r.data[0];
      })
      .then(async (e) => {
        if (e) return e;
        const freeProduct = this.stripeConfig.product.free;
        const product = await this.stripe.products.retrieve(freeProduct, {
          expand: ['default_price'],
        });
        if (!product) throw new Error('Product not found');
        const defaultPrice = product.default_price;
        if (!defaultPrice) throw new Error('Product price not found');
        if (typeof defaultPrice !== 'object')
          throw new Error('Product price not found');
        const defaultPriceId = defaultPrice.id;
        return await this.stripe.subscriptions
          .create({
            customer: customerId,
            items: [{ price: defaultPriceId }],
          })
          .then((sub) => {
            return this.stripe.entitlements.activeEntitlements
              .list({ customer: customerId, expand: ['data.feature'] })
              .then((r) => {
                return r.data[0];
              });
          });
      });
  }

  @Get('billing-portal')
  @ApiParam({ name: 'return_url', required: false })
  async getCustomerPortal(
    @HttpUser() user,
    @Req() req: Request,
    @Query('return_url') return_url?: string,
  ) {
    const customerId = user.metadata.customer_id;
    if (!customerId) throw new Error('"customer_id" is required');
    const cachekey = `stripe_portal_${customerId}`;
    const cached = await this.cache.get<{ id: string; url: string }>(cachekey);
    if (cached) return cached;
    return this.stripe.billingPortal.sessions
      .create({
        customer: customerId,
        return_url: return_url ?? req.headers.referer,
        expand: ['configuration'],
      })
      .then((session) => session)
      .then((portal) => {
        const cache_ttl = 30 * 60 * 1000;
        const ttl_ml = portal.created * 1000 - Date.now() + cache_ttl;
        return this.cache.set(cachekey, portal, ttl_ml).then(() => portal);
      });
  }
}
