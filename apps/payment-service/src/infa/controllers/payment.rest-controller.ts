// import * as common from '@nestjs/common';
// import * as swagger from '@nestjs/swagger';
// import { Response } from 'express';

import { Cache } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authenticated, HttpUser } from 'libs/auth-client';
import Stripe from 'stripe';

@Controller('payment')
@ApiTags('payment')
export class PaymentRestController {
  constructor(
    private readonly configService: ConfigService,
    private readonly cache: Cache,
    private readonly stripe: Stripe,
  ) {}

  @Get('billing/customer-session')
  @UseGuards(Authenticated)
  @ApiBearerAuth()
  async stripePublicKey(@HttpUser() user) {
    const email = user.email;
    if (!email) throw new Error("Missing 'email' in 'user'");
    const cached = await this.cache.get(`stripe-customer-session-${email}`);
    if (cached) return cached;

    const customer = await this.stripe.customers
      .list({ email })
      .then((r) => r.data[0]);
    if (!customer) throw new Error('customer.not_found');

    return await this.stripe.customerSessions
      .create({
        customer: customer.id,
        components: {
          pricing_table: { enabled: true },
        },
      })
      .then((session) => {
        return {
          data: {
            clientSecret: session.client_secret,
            expiresAt: session.expires_at,
          },
        };
      })
      .then((session) => {
        const ttl = session.data.expiresAt * 1000 - Date.now();
        return this.cache
          .set(`stripe-customer-session-${email}`, session, ttl)
          .then(() => session);
      })
      .catch((err) => {
        console.error(err);
        throw new BadRequestException(err.message);
      });
  }

  @Get('stripe-webhook')
  async stripeWebhookGet() {
    return 'stripe webhook';
  }

  @Post('stripe-webhook')
  async stripeWebhook(@Req() req) {
    const endpointSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody.toString(),
        sig,
        endpointSecret,
      );
    } catch (err: any) {
      console.error(err);
      const msg = `Webhook Error: ${err.message}`;
      throw new BadRequestException(msg);
    }

    console.log('event', event);
    if (event.type.startsWith('customer.subscription')) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer.toString();
      const customer = await this.stripe.customers.retrieve(customerId);
      if (customer.deleted) throw new BadRequestException('Customer not found');
      if (customer.email) await this.cache.del(customer.email);
      console.log('Deleted cache', customer.email);
    }
  }
}
