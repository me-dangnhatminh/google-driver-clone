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
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('payment')
export class PaymentRestController {
  constructor(
    private readonly configService: ConfigService,
    private readonly cache: Cache,
    private readonly stripe: Stripe,
  ) {}

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
