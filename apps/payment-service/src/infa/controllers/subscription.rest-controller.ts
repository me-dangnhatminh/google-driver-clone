import { Controller, Inject, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authenticated, HttpUser } from 'libs/auth-client';
import * as rx from 'rxjs';

@Controller({ path: 'subscriptions', version: '1' })
@ApiTags('subscription')
@ApiBearerAuth()
@UseGuards(Authenticated)
export class SubscriptionRestController {
  constructor(
    @Inject('SubscriptionService')
    private readonly subscriptionService: any,
  ) {}

  @Get('plans')
  customerPlan(@HttpUser() user: any) {
    const get = this.subscriptionService.customerPlan({
      customerId: user.email,
      serviceName: 'storage',
    });
    return rx.from(get);
  }
}
