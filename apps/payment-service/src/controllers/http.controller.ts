import * as common from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../services';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

const payments = [
  {
    id: '1',
    amount: 100,
    currency: 'USD',
    status: 'paid',
  },
  {
    id: '2',
    amount: 200,
    currency: 'USD',
    status: 'paid',
  },
];

@common.Controller({ path: 'payment', version: '1' })
@ApiTags('payment')
export class HTTPController {
  constructor(private readonly paymentService: PaymentService) {}

  @common.Get()
  listPayments() {
    // only admin can list payments
    return payments;
  }

  @common.Get('users')
  getHello(): string {
    return 'Hello World!';
  }

  @common.Get('subscribe')
  subscribe() {
    return this.paymentService.subscribe();
  }

  @common.Get('checkout')
  checkout(): string {
    return 'Checkout';
  }

  // ======================
  @EventPattern('planed')
  planedEvent(@Payload() data: number[], @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    console.log('PaymentService: planed event', data);

    channel.ack(originalMsg);
  }
}
