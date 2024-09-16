import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import Stripe from 'stripe';
import z from 'zod';
import { useZod } from '../pipes';

import { Authenticated, AllowedPermission, Permissions } from 'lib/auth-client';

const CreateProductInput = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(['service', 'good']).default('service'),
  metadata: z.record(z.string()).optional(),
});
type CreateProductInput = z.infer<typeof CreateProductInput>;

@ApiTags('billing')
@Controller({ path: 'billings', version: '1' })
@UseGuards(Authenticated, AllowedPermission)
@Permissions('manage:billing')
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
  createProduct(@Body(useZod(CreateProductInput)) body: CreateProductInput) {
    return this.stripe.products.create(body).catch((error) => {
      if (error.code === 'product_already_exists') {
        throw new BadRequestException(`Product already exists: ${body.id}`);
      }
      throw error;
    });
  }

  @Get('products')
  listProducts() {
    return this.stripe.products.list();
  }

  @Delete('products')
  @ApiQuery({ name: 'ids', type: 'string', isArray: true })
  async deleteProduct(@Query('ids') ids: [string, ...string[]]) {
    ids = Array.isArray(ids) ? ids : [ids];
    // clear
    // const { data } = await this.stripe.products.list();
    // return Promise.all(data.map((id) => this.stripe.products.del(id.id)));
    return Promise.all(ids.map((id) => this.stripe.products.del(id)));
  }

  @Post('plans')
  createPlan(@Body() body) {
    return this.stripe.plans
      .create({
        id: 'plan_123',
        product: body.productId,
        currency: 'usd',
        interval: 'month',
        amount: 1000,
        usage_type: 'licensed',
      })
      .catch((error) => {
        if (error.code === 'product_not_found') {
          throw new BadRequestException(`Product not found: ${body.productId}`);
        }

        if (error.code === 'plan_already_exists') {
          throw new BadRequestException(`Plan already exists: ${body.id}`);
        }

        if (error.code === 'invalid_request_error') {
          throw new BadRequestException({
            message: 'Plan is invalid',
            data: error.raw,
          });
        }

        throw error;
      });
  }

  @Get('plans')
  listPlans() {
    return {
      code: 'ok',
      data: [],
    };
  }
}
