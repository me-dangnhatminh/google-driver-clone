import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ZodBody } from 'lib/common';
import Stripe from 'stripe';
import z from 'zod';

const LinhTinh = z.object({
  name: z.string().default('LinhTinh'),
});
type LinhTinh = z.infer<typeof LinhTinh>;

const CreateProductInput = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(['service', 'good']).default('service'),
  metadata: z.record(z.string()).optional(),
});
type CreateProductInput = z.infer<typeof CreateProductInput>;

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
  createProduct(@Body() body: CreateProductInput) {
    return this.stripe.products.create(body);
  }

  @Get('products')
  listProducts(@ZodBody(LinhTinh) body: LinhTinh) {}

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
