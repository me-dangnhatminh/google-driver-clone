import { Controller } from '@nestjs/common';
import Stripe from 'stripe';

import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Customer } from 'src/domain';

import { randomUUID as uuid } from 'crypto';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class CustomerGrpcController {
  private readonly tx: TransactionHost<TransactionalAdapterPrisma>['tx'];

  constructor(
    private readonly stripe: Stripe,
    txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {
    this.tx = txHost.tx;
  }

  @GrpcMethod('CustomerService', 'subscription')
  async subscription(request, metadata) {
    const customerId = metadata.get('customer_id');
    if (!customerId) throw new Error('customer_id is required');

    const customer = await this.upsertByEmail({ email: request.email });

    if (customer.account_id) {
      return this.stripe.customers.retrieve(customer.account_id);
    } else {
      const idempotencyKey = `stripe_create_customer_${customer.id}`;
      return this.stripe.customers
        .create({ email: request.email }, { idempotencyKey })
        .then((stripeCustomer) => {
          return this.tx.customer
            .update({
              where: { id: customer.id },
              data: { account_id: stripeCustomer.id, account_isp: 'stripe' },
            })
            .then(() => stripeCustomer);
        });
    }
  }

  @Transactional()
  async upsertByEmail(request) {
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
}
