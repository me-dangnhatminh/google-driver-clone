import * as common from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../../app/services';
import { AuthGuard } from 'src/infa/guards/auth.guard';

@common.Controller({ path: 'payment', version: '1' })
@ApiTags('payment')
@ApiBearerAuth()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @common.Get('plans')
  async listPlans() {
    return await this.paymentService.listPlans();
  }

  @common.Post('plans')
  async createPlan() {
    // only admin
    throw new Error('Not implemented');
  }

  @common.Get('plans/:id')
  async getPlanById() {
    throw new Error('Not implemented');
  }

  @common.UseGuards(AuthGuard)
  @common.Get('users')
  getHello(): string {
    return 'Hello World!';
  }

  @common.Get('subscribe')
  subscribe() {
    return 'Subscribe';
  }

  @common.Get('unsubscribe')
  unsubscribe() {
    return 'Unsubscribe';
  }

  @common.Get('invoices')
  invoices() {
    return 'Invoices';
  }

  @common.Get('invoices/:id')
  invoiceById() {
    return 'Invoice by ID';
  }

  @common.Get('subscriptions')
  subscriptions() {
    return 'Subscriptions';
  }

  @common.Get('subscriptions/:id')
  subscriptionById() {
    return 'Subscription by ID';
  }

  @common.Get('subscriptions/:id/invoices')
  subscriptionInvoices() {
    return 'Subscription invoices';
  }

  @common.Get('subscriptions/:id/invoices/:invoiceId')
  subscriptionInvoiceById() {
    return 'Subscription invoice by ID';
  }

  @common.Get('subscriptions/:id/usage')
  subscriptionUsage() {
    return 'Subscription usage';
  }

  @common.Get('subscriptions/:id/usage/:usageId')
  subscriptionUsageById() {
    return 'Subscription usage by ID';
  }

  @common.Get('subscriptions/:id/usage/:usageId/invoices')
  subscriptionUsageInvoices() {
    return 'Subscription usage invoices';
  }
}
