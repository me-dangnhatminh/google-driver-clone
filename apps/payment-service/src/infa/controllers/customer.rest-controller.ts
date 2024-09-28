import { Cache } from '@nestjs/cache-manager';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import Stripe from 'stripe';

import { Authenticated, HttpUser } from 'libs/auth-client';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Customer } from 'src/domain';

import { randomUUID as uuid } from 'crypto';

@ApiTags('customer')
@ApiBearerAuth()
@Controller('payment/customer')
@UseGuards(Authenticated)
export class CustomerRestController {
  private readonly tx: TransactionHost<TransactionalAdapterPrisma>['tx'];

  constructor(
    private readonly stripe: Stripe,
    private readonly cache: Cache,
    txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {
    this.tx = txHost.tx;
  }

  @Transactional()
  async upsertByEmail(request: { email: string }) {
    const now = new Date();
    const email = request.email;
    const customer: Customer = await this.tx.customer
      .upsert({
        where: { email },
        create: {
          id: uuid(),
          email: email,
          created_at: now,
          updated_at: now,
          metadata: {},
          status: 'active',
        },
        update: {},
      })
      .then((rs) => Customer.parse(rs));
    return customer;
  }

  @Transactional()
  async updateCustomer(request: { id: string; data: any }) {
    return await this.tx.customer
      .update({ where: { id: request.id }, data: request.data })
      .then((rs) => Customer.parse(rs));
  }

  @Get('demo')
  async demo(@HttpUser() user) {
    const customer = await this.upsertByEmail({ email: user.email });

    if (customer.account_id) {
      return await this.stripe.customers.retrieve(customer.account_id);
    }

    const idempotencyKey = `stripe_customer_${customer.id}`;
    return await this.stripe.customers
      .create({ email: user.email }, { idempotencyKey })
      .then((stripeCustomer) =>
        this.updateCustomer({
          id: customer.id,
          data: {
            account_id: stripeCustomer.id,
            account_isp: 'stripe',
            updated_at: new Date(stripeCustomer.created * 1000),
          },
        }).then(() => stripeCustomer),
      );
  }

  @Get('billing-portal')
  @ApiParam({ name: 'return_url', required: false })
  async getCustomerPortal(
    @HttpUser() user,
    @Req() req: Request,
    @Query('return_url') return_url?: string,
  ) {
    const customer = await this.upsertByEmail({ email: user.email });

    const cachekey = `stripe_portal_${customer.id}`;
    await this.cache.del(cachekey);
    const cached = await this.cache.get<{ id: string; url: string }>(cachekey);
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
        return this.cache.set(cachekey, portal, ttl_ml).then(() => portal);
      });
  }
}
