import { SubscriptionGprcController } from './subscription.gprc-controller';

// import { BillingRestController } from './billing.rest-controller';
// import { PlanRestController } from './plan.rest-controller';
// import { SubscriptionRestController } from './subscription.rest-controller';

import { PaymentRestController } from './payment.rest-controller';
import { CustomerRestController } from './customer.rest-controller';

export const controllers = [
  SubscriptionGprcController,
  CustomerRestController,
  PaymentRestController,
];

export default controllers;
