import { SubscriptionGprcController } from './subscription.gprc-controller';

import { BillingRestController } from './billing.rest-controller';
import { PlanRestController } from './plan.rest-controller';
import { SubscriptionRestController } from './subscription.rest-controller';

export const controllers = [
  SubscriptionGprcController,
  PlanRestController,
  BillingRestController,
  SubscriptionRestController,
];
