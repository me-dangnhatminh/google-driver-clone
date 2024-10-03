import { SubscriptionGprcController } from './subscription.gprc-controller';

import { PaymentRestController } from './payment.rest-controller';
import { CustomerRestController } from './customer.rest-controller';
import { HealthController } from './health.controller';

export const controllers = [
  HealthController,
  SubscriptionGprcController,
  CustomerRestController,
  PaymentRestController,
];

export default controllers;
