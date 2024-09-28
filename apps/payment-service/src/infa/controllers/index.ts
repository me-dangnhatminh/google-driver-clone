import { SubscriptionGprcController } from './subscription.gprc-controller';

import { PaymentRestController } from './payment.rest-controller';
import { CustomerRestController } from './customer.rest-controller';

export const controllers = [
  SubscriptionGprcController,
  CustomerRestController,
  PaymentRestController,
];

export default controllers;
