import { InjectStripeClient } from '@golevelup/nestjs-stripe';
import * as common from '@nestjs/common';
import * as swagger from '@nestjs/swagger';
import Stripe from 'stripe';

@common.Controller({ path: 'subscriptions', version: '1' })
@swagger.ApiTags('subscription')
export class SubscriptionRestController {
  constructor(@InjectStripeClient() private readonly stripe: Stripe) {}

  @common.Get('products')
  async listProducts() {
    return await this.stripe.products.list({}).then((res) => res.data);
  }

  @common.Post('subscriptions')
  @swagger.ApiOperation({
    summary: 'Create a subscription',
    description: 'Create a subscription for a customer',
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              customerId: { type: 'string' },
              priceId: { type: 'string' },
              paymentMethodId: { type: 'string' },
            },
            examples: {
              example1: {
                value: {
                  customerId: 'cus_J6QW1j6q7vYK8Y',
                  priceId: 'price_1J6QW1J6q7vYK8Y',
                  paymentMethodId: 'prod_QeMf8NxA6pdiEe',
                },
              },
            },
          },
        },
      },
    },
  })
  async createSubscription(
    @common.Body('customerId') customerId: string,
    @common.Body('priceId') priceId: string,
    @common.Body('paymentMethodId') paymentMethodId: string,
  ) {
    // register customer with stripe
    await this.stripe.customers
      .create({
        payment_method: paymentMethodId,
        balance: 10000,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })
      .then((res) => {
        console.log(res);
      });

    // return await this.stripe.subscriptions
    //   .create({
    //     customer: customerId,
    //     items: [{ price: priceId }],
    //     default_payment_method: paymentMethodId,
    //   })
    //   .then((res) => res);
  }
}
