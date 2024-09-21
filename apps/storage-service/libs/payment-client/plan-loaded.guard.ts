import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as rx from 'rxjs';

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
