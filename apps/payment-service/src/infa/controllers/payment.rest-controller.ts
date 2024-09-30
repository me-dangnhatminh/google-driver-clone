/* eslint-disable prefer-const */
import { Cache } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authenticated, HttpUser } from 'libs/auth-client';
import { Configs } from 'src/config';
import Stripe from 'stripe';
import { randomUUID as uuid } from 'crypto';
import * as rx from 'rxjs';

@Controller('payment')
@ApiTags('payment')
export class PaymentRestController {
  readonly stripeConfig = this.configService.get('stripe', { infer: true });

  constructor(
    private readonly configService: ConfigService<Configs, true>,
    private readonly cache: Cache,
    private readonly stripe: Stripe,
    @Inject('StorageService') private readonly storageService: any,
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

  // get current user's subscription
  @Get('subscription')
  @UseGuards(Authenticated)
  @ApiBearerAuth()
  async subscription(@HttpUser() user) {
    const email = user.email;

    const stripeCustomer = await this.cache
      .get(`stripe_customer_${email}`)
      .then((cached) => {
        if (cached) return cached as Stripe.Customer;
        return this.stripe.customers
          .list({
            email,
            limit: 1,
            expand: ['data.subscriptions.data.default_payment_method'],
          })
          .then((r) => r.data[0])
          .then((customer) => {
            if (!customer) throw new Error('customer.not_found');
            return customer;
          })
          .then((customer) => {
            return this.cache
              .set(`stripe_customer_${email}`, customer, 60 * 60 * 24) // 24 hours
              .then(() => customer);
          });
      });

    return stripeCustomer;

    const subscription = await this.stripe.subscriptions.list({
      customer: stripeCustomer.id,
      status: 'active',
    });

    return subscription;
  }

  // cus_QuYqPCmwAH2Yfy
  // cus_QtH6te5U1OkQbi
  @Get('demo')
  async demo(@Req() req) {
    let res;
    res = await this.stripe.billingPortal.sessions.create({
      customer: 'cus_QtH6te5U1OkQbi',
      return_url: req.headers.referer,
    });

    // res = await this.stripe.products.retrieve('prod_QuYysnLE9SOf6J', {
    //   expand: ['price', 'default_price'],
    // });
    return res;
  }

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
        components: { pricing_table: { enabled: true } },
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

  @Post('stripe-webhook')
  async stripeWebhook(@Req() req) {
    const wbSecret = this.stripeConfig.webhookSecret;
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req.rawBody, sig, wbSecret);
    } catch (err: any) {
      console.error(err);
      const msg = `Webhook Error: ${err.message}`;
      throw new BadRequestException(msg);
    }

    switch (event.type) {
      case 'customer.created':
        return await this.customerCreatedHandler(event);
      case 'customer.subscription.created':
        return await this.subscriptionCreatedHandler(event);
      default:
        console.log('Unhandled event type:', event.type);
        return { received: true };
    }
  }

  async customerCreatedHandler(event: Stripe.CustomerCreatedEvent) {
    throw new Error('Method not implemented.');
  }

  async subscriptionCreatedHandler(
    event: Stripe.CustomerSubscriptionCreatedEvent,
  ) {
    const subscription = event.data.object;
    const customer = subscription.customer;
    const customer_id = typeof customer === 'string' ? customer : customer.id;
    const customerData = await this.stripe.customers.retrieve(customer_id);
    if (customerData.deleted) throw new Error('Customer deleted');
    const accountId = customerData.metadata.auth0_user_id;
    if (!accountId) throw new Error("Missing 'auth0_user_id' in customer");
    const GB_as_byte = 1024 * 1024 * 1024; // 1 GB
    console.log('accountId', accountId);
    const fetch: rx.Observable<unknown> = this.storageService.initial({
      ownerId: accountId,
      total: 5 * GB_as_byte, // TODO: change 'total' to 'limit'
    });
    return await rx.from(fetch).toPromise();
  }
}
