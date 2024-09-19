import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';

import Stripe from 'stripe';

@ApiTags('billing')
@Controller({ path: 'billings', version: '1' })
@ApiBearerAuth()
export class BillingRestController {
  constructor(private readonly stripe: Stripe) {}

  @Post('products')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string', enum: ['service', 'good'] },
        options: {
          type: 'object',
          properties: {
            metadata: {
              type: 'object',
              additionalProperties: { type: 'string' },
            },
          },
        },
      },
    },
  })
  createProduct(@Body() body) {
    return this.stripe.products.create(body);
  }

  @Get('products')
  listProducts() {
    return this.stripe.products.list().then((res) => res.data);
  }

  @Delete('products')
  @ApiQuery({ name: 'ids', type: 'string', isArray: true })
  deleteProduct(@Query('ids') ids: [string, ...string[]]) {
    ids = Array.isArray(ids) ? ids : [ids];
    return Promise.all(ids.map((id) => this.stripe.products.del(id)));
  }

  @Post('plans')
  createPlan(@Body() body) {
    return this.stripe.plans.create(body);
  }

  @Get('plans')
  listPlans() {
    return this.stripe.plans.list().then((res) => res.data);
  }
}
