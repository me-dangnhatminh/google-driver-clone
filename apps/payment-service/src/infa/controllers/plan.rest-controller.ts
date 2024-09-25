import { Cache } from '@nestjs/cache-manager';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authenticated, HttpUser } from 'libs/auth-client';
import Stripe from 'stripe';

@Controller('plan')
@ApiTags('plan')
@ApiBearerAuth()
@UseGuards(Authenticated)
export class PlanRestController {
  constructor(
    private readonly stripe: Stripe,
    private readonly cache: Cache,
  ) {}

  // get plan of customer
  @Get('my-subscription')
  async customerPlan(@HttpUser() user) {
    await this.stripe.customers.create({
      email: user.email,
      name: user.name,
    });

    const cahed = await this.cache.get(user.id);

    return await this.stripe.subscriptions
      .list({ customer: 'cus_QeMXyUWyUecEuo' })
      .then((sub) => {
        const product = sub.data[0].items.data[0].price.product;
        return this.stripe.products.retrieve(product.toString());
      })
      .then((product) => {
        return {
          customer: 'cus_QeMXyUWyUecEuo',
          unit: product.unit_label,
          size: product.metadata.size,
        };
      });
  }
}
