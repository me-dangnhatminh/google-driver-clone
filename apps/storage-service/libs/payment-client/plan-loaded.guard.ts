import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as rx from 'rxjs';

const MAP = {
  KB: 1 / 1024 / 1024,
  MB: 1 / 1024,
  GB: 1,
  TB: 1024,
  PB: 1024 * 1024,
  EB: 1024 * 1024 * 1024,
};

export const toGB = (bytes: string) => {
  bytes = bytes.toUpperCase();
  const reg = /(\d+)([KMGTPEZY]?B)/;
  const v = reg.exec(bytes);
  if (!v) {
    throw new Error('Invalid size');
  }

  const [_, size, unit] = v;
  console.log(_);
  return parseFloat(size) * MAP[unit];
};

@Injectable()
export class PlanLoadedGuard implements CanActivate {
  constructor(
    @Inject('SubscriptionService')
    private readonly subscriptionService,
  ) {}
  canActivate(context: ExecutionContext) {
    const [req] = context.getArgs();
    const email = req.auth.user.email;
    return rx
      .from(this.subscriptionService.customerPlan({ customerId: email }))
      .pipe(
        rx.map((plan) => {
          req.plan = plan;
          return true;
        }),
      );
  }
}
