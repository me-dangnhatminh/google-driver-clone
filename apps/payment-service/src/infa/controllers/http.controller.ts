import * as common from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../../services';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuthGuard } from 'src/infa/guards/auth.guard';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

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
@ApiBearerAuth()
export class HTTPController {
  constructor(
    @common.Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly paymentService: PaymentService,
  ) {}

  // ======================
  @EventPattern('planed')
  planedEvent(@Payload() data, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    console.log('PaymentService: planed event', data);

    channel.ack(originalMsg);
  }

  // ======================

  @common.Get()
  listPayments() {
    // only admin can list payments
    return payments;
  }

  @common.UseGuards(AuthGuard)
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
}
