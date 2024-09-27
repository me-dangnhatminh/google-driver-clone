import { Cache } from '@nestjs/cache-manager';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Authenticated, HttpUser } from 'libs/auth-client';

import Stripe from 'stripe';

@ApiTags('customer')
@ApiBearerAuth()
@Controller('payment/customer')
@UseGuards(Authenticated)
export class CustomerRestController {
  constructor(
    private readonly stripe: Stripe,
    private readonly cache: Cache,
  ) {}

  async getCustomer(email: string) {
    const key = `stripe_customer_${email}`;
    const cached = await this.cache.get<Stripe.Customer>(key);
    if (cached) return cached;
    return this.stripe.customers
      .list({
        email,
        limit: 1,
        expand: ['data.subscriptions.data.default_payment_method'],
      })
      .then((r) => r.data[0])
      .then((customer) => {
        if (!customer) throw new Error('customer.not_found');
        return this.cache
          .set(`stripe_customer_${email}`, customer, 60 * 60 * 24) // 24 hours
          .then(() => customer);
      });
  }

  @Get('billing-portal')
  @ApiParam({ name: 'return_url', required: false })
  async getCustomerPortal(
    @HttpUser() user,
    @Req() req: Request,
    @Query('return_url') return_url?: string,
  ) {
    const customer = await this.getCustomer(user.email);

    const key = `stripe_portal_${customer.id}`;
    await this.cache.del(key);
    const cached = await this.cache.get<{ id: string; url: string }>(key);
    if (cached) return cached;
    return this.stripe.billingPortal.sessions
      .create({
        customer: customer.id,
        return_url: return_url ?? req.headers.referer,
        expand: ['configuration'],
      })
      .then((session) => session)
      .then((portal) => {
        const cache_ttl = 30 * 60 * 1000;
        const ttl_ml = portal.created * 1000 - Date.now() + cache_ttl;
        return this.cache.set(key, portal, ttl_ml).then(() => portal);
      });
  }
}
